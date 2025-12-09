"use client";

import { TripContext } from "@/components/chat-interface/trip-context-dialog";
import { useSafeUser } from "@/hooks/use-safe-user";
import { invalidateChats } from "@/lib/actions/chat";
import type { CreditStatus } from "@/lib/actions/credit-manager";
import type { AirminiUIMessage } from "@/types/chat";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface UseChatInterfaceOptions {
	chatId: string;
	initialMessages: AirminiUIMessage[];
	credits?: CreditStatus | null;
	isNewChat?: boolean;
}

export function useChatInterface({
	chatId,
	initialMessages,
	credits,
	isNewChat,
}: UseChatInterfaceOptions) {
	const [prompt, setPrompt] = useState("");
	const [isStreaming, setIsStreaming] = useState(false);
	const [tripContext, setTripContext] = useState<TripContext | null>(null);
	const [activeCategory, setActiveCategory] = useState("");

	const containerRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);

	const { user } = useSafeUser();
	const userName = user?.fullName || user?.firstName;

	// Credit calculations
	const remaining = credits ? credits.remaining : Infinity;
	const isGuest = !user;
	const hasCredits = isGuest || remaining > 0;
	const remainingCredits = isGuest ? Infinity : remaining;

	// Chat transport
	const transport = useMemo(
		() =>
			new DefaultChatTransport({
				api: "/api/chat",
			}),
		[]
	);

	const { messages, sendMessage } = useChat({
		id: chatId,
		messages: initialMessages,
		transport,
		onFinish: async () => {
			await invalidateChats();
			setIsStreaming(false);
		},
		onError: (err) => {
			console.error("Chat error:", err);
			setIsStreaming(false);
			toast.error("Something went wrong. Please try again.");
		},
	});

	// Auto-scroll on new messages
	useEffect(() => {
		if (!containerRef.current || !bottomRef.current) return;
		containerRef.current.scrollTo({
			top: containerRef.current.scrollHeight,
			behavior: "smooth",
		});
	}, [messages.length]);

	// Send message handler
	const handleSendMessage = useCallback(async () => {
		if (!hasCredits) {
			toast.error(
				"You've reached your message limit for now. Please wait for it to reset."
			);
			return;
		}

		if (!prompt.trim() || isStreaming) return;

		if (isNewChat) {
			window.history.replaceState(null, "", `/chat/${chatId}`);
		}

		const messageContent = prompt;
		setPrompt("");
		setIsStreaming(true);

		try {
			await sendMessage(
				{ text: messageContent },
				{ body: tripContext ? { tripContext } : undefined }
			);
		} catch (err) {
			console.error("sendMessage error:", err);
			toast.error("Failed to send message");
			setIsStreaming(false);
		}
	}, [
		prompt,
		isStreaming,
		hasCredits,
		isNewChat,
		chatId,
		tripContext,
		sendMessage,
	]);

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

		// Messages
		messages,
		isFirstResponse: messages.length === 0,

		// Handlers
		handleSendMessage,
		handleSelectSuggestion,
		handleSelectCategory,
	};
}
