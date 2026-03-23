"use client";

import { useSafeUser } from "@/hooks/use-safe-user";
import { invalidateChats } from "@/lib/actions/chat";
import { type CreditStatus } from "@/lib/actions/credit-manager";
import { GUEST_MESSAGE_LIMIT } from "@/lib/constants/chat";
import type { AirminiUIMessage, TripContext } from "@/types/chat";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface UseChatInterfaceOptions {
	chatId: string;
	initialMessages: AirminiUIMessage[];
	credits?: CreditStatus | null;
	isNewChat?: boolean;
	initialTripContext?: TripContext | null;
}

export function useChatInterface({
	chatId,
	initialMessages,
	credits,
	isNewChat,
	initialTripContext,
}: UseChatInterfaceOptions) {
	const [prompt, setPrompt] = useState("");
	const [tripContext, setTripContext] = useState<TripContext | null>(
		initialTripContext ?? null
	);
	const [activeCategory, setActiveCategory] = useState("");
	const router = useRouter();
	const containerRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	// Track whether we've already updated the URL for this new chat session
	const hasUpdatedUrlRef = useRef(false);

	const { user, isSignedIn } = useSafeUser();
	const userName = user?.fullName || user?.firstName;
	const isGuest = !isSignedIn;

	// Credit calculations (authenticated)
	const remaining = credits?.remaining ?? 0;
	const resetAt = credits?.resetAt ?? null;

	// Guest rate limit state — pulled from Redis via GET /api/chat/rate-limit
	const [guestRemaining, setGuestRemaining] = useState<number>(GUEST_MESSAGE_LIMIT);
	const [guestResetAt, setGuestResetAt] = useState<string | null>(null);

	const refreshGuestRemaining = useCallback(() => {
		fetch("/api/chat/rate-limit")
			.then((r) => r.json())
			.then((data: { remaining: number; reset?: string }) => {
				if (typeof data.remaining === "number") setGuestRemaining(data.remaining);
				if (data.reset) setGuestResetAt(data.reset);
			})
			.catch(() => {/* keep default */});
	}, []);

	useEffect(() => {
		if (!isGuest) return;
		refreshGuestRemaining();
	}, [isGuest, refreshGuestRemaining]);

	const hasCredits = isGuest ? guestRemaining > 0 : remaining > 0;
	const remainingCredits = isGuest ? guestRemaining : remaining;
	const effectiveResetAt = isGuest ? guestResetAt : resetAt;

	const transport = useMemo(
		() =>
			new DefaultChatTransport({
				api: "/api/chat",
			}),
		[]
	);

	const { messages, sendMessage, status, regenerate } = useChat({
		id: chatId,
		messages: initialMessages,
		transport,
		onFinish: async () => {
			if (isGuest) {
				refreshGuestRemaining();
			}
		},
		onError: (err) => {
			console.error("Chat error:", err);
			// Check for guest rate limit — message body contains our JSON
			try {
				const body = JSON.parse(err.message);
				if (body?.error === "rate_limit") {
					toast.error("Free limit reached", {
						description: `You've used all ${GUEST_MESSAGE_LIMIT} free messages. Sign in for unlimited access.`,
						action: { label: "Sign in", onClick: () => router.push("/sign-in") },
						duration: 8000,
					});
					return;
				}
			} catch {
				// not a JSON error — fall through
			}
			toast.error("Something went wrong. Please try again.");
		},
	});

	// Derived from SDK status — single source of truth, no manual state to desync
	const isStreaming = status === "streaming" || status === "submitted";

	const handleRegenerate = useCallback(() => {
		if (isStreaming) return;
		regenerate();
	}, [isStreaming, regenerate]);

	// Send message handler
	const handleSendMessage = useCallback(async () => {
		if (!hasCredits) {
			toast.error(
				"You've reached your message limit for now. Please wait for it to reset."
			);
			return;
		}

		if (!prompt.trim() || isStreaming) return;

		const messageContent = prompt;
		setPrompt("");

		// For new chats: update URL and invalidate sidebar cache BEFORE streaming.
		// Doing this after streaming (in onFinish) caused router.refresh() to remount
		// Interface from a different route segment (/chat → /chat/[id]), creating a new
		// Chat instance seeded with text-only DB messages and losing follow-up suggestions.
		if (isSignedIn && isNewChat && !hasUpdatedUrlRef.current) {
			hasUpdatedUrlRef.current = true;
			window.history.replaceState(null, "", `/chat/${chatId}`);
			await invalidateChats();
			// No router.refresh() — sidebar picks up the invalidated cache on next navigation.
		}

		try {
			await sendMessage(
				{ text: messageContent },
				{ body: tripContext ? { tripContext } : undefined }
			);
		} catch (err) {
			console.error("sendMessage error:", err);
			toast.error("Failed to send message");
		}
	}, [prompt, isStreaming, hasCredits, tripContext, sendMessage, isSignedIn, isNewChat, chatId]);

	// Select suggestion
	const handleSelectSuggestion = useCallback((suggestion: string) => {
		setPrompt(suggestion);
		setActiveCategory("");
	}, []);

	// Select category
	const handleSelectCategory = useCallback((category: string) => {
		setActiveCategory(category);
		setPrompt("");
	}, []);

	return {
		// State
		prompt,
		setPrompt,
		isStreaming,
		tripContext,
		setTripContext,
		activeCategory,
		setActiveCategory,

		// Refs
		containerRef,
		bottomRef,

		// User info
		user,
		userName,
		isGuest,

		// Credits
		hasCredits,
		remainingCredits,
		resetAt: effectiveResetAt,
		guestLimit: GUEST_MESSAGE_LIMIT,

		// Messages
		messages,
		isFirstResponse: messages.length === 0,

		// Handlers
		handleSendMessage,
		handleRegenerate,
		handleSelectSuggestion,
		handleSelectCategory,
	};
}
