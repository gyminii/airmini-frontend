"use client";

import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { CopyIcon } from "@radix-ui/react-icons";
import Lottie from "lottie-react";
import {
	ArrowUpIcon,
	Plane,
	FileUser,
	Hotel,
	Globe,
	MicIcon,
	Paperclip,
	SquareIcon,
	X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { ChatContainer } from "@/components/ui/custom/prompt/chat-container";
import {
	Input,
	PromptInputAction,
	PromptInputActions,
	PromptInputTextarea,
} from "@/components/ui/custom/prompt/input";
import { PromptLoader } from "@/components/ui/custom/prompt/loader";
import { Markdown } from "@/components/ui/custom/prompt/markdown";
import {
	Message,
	MessageAction,
	MessageActions,
	MessageContent,
} from "@/components/ui/custom/prompt/message";
import { PromptScrollButton } from "@/components/ui/custom/prompt/scroll-button";
import { Suggestion } from "@/components/ui/custom/prompt/suggestion";

import planeAnimation from "../../data/Loading 40 _ Paperplane.json";
import { AIUpgradePricingModal } from "./ai-upgrade-modal";
import { useCredits } from "@/hooks/use-credits";
import { useChatMessages, convertToUIMessages } from "@/hooks/use-chat";
import { toast } from "sonner";
import type { ChatSummary } from "@/types/chat";
import { useClaimConversation } from "@/hooks/use-chat";
const suggestionGroups = [
	{
		icon: FileUser,
		label: "Visa Requirements",
		highlight: "Do I need",
		items: [
			"Do I need a visa to travel to Japan from South Korea?",
			"Do I need a visa for a layover in the US?",
			"Do I need a tourist visa for France?",
			"Do I need a transit visa for Dubai?",
		],
	},
	{
		icon: Plane,
		label: "Flight Info",
		highlight: "What are",
		items: [
			"What are the baggage restrictions for international flights?",
			"What are the best times to book cheap flights?",
			"What are the carry-on size limits?",
			"What are the liquids rules for flights?",
		],
	},
	{
		icon: Hotel,
		label: "Accommodation",
		highlight: "Where should",
		items: [
			"Where should I stay in Tokyo for first-time visitors?",
			"Where should I book hotels for the best prices?",
			"Where should I stay near the airport?",
			"Where should I look for vacation rentals?",
		],
	},
	{
		icon: Globe,
		label: "Travel Tips",
		highlight: "What should",
		items: [
			"What should I pack for a 2-week trip to Europe?",
			"What should I know about travel insurance?",
			"What should I do if I lose my passport abroad?",
			"What should I know about currency exchange?",
		],
	},
];

export default function AIChatInterface() {
	const [prompt, setPrompt] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const uploadInputRef = useRef<HTMLInputElement>(null);
	const [activeCategory, setActiveCategory] = useState("");
	const containerRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);

	const router = useRouter();
	const params = useParams<{ chat_id?: string[] }>();
	const queryClient = useQueryClient();
	const { isSignedIn, isLoaded } = useAuth();
	const claimConversation = useClaimConversation();
	const hasClaimedRef = useRef(false);

	const { hasCredits, remainingCredits, incrementMessageCount, isGuest } =
		useCredits();

	// Get chat_id from catch-all route
	const chatIdFromUrl = params?.chat_id?.[0];

	const [isStreaming, setIsStreaming] = useState(false);
	const streamingChatIdRef = useRef<string | null>(null);
	const hasRedirectedRef = useRef(false);

	// The effective chat ID for useChat - prioritize streaming ID during active stream
	const effectiveChatId = chatIdFromUrl ?? "new";

	// Fetch existing messages for this chat
	const { data: existingMessages, isLoading: isLoadingMessages } =
		useChatMessages(chatIdFromUrl);

	// Convert to UIMessage format for initial messages
	const initialMessages = useMemo(() => {
		if (!existingMessages || existingMessages.length === 0) return undefined;
		return convertToUIMessages(existingMessages);
	}, [existingMessages]);

	// Memoize transport
	const transport = useMemo(
		() =>
			new DefaultChatTransport({
				api: "/api/chat",
			}),
		[]
	);

	const {
		messages: chatMessages,
		sendMessage,
		setMessages,
	} = useChat({
		id: effectiveChatId,
		transport,
		onData: (dataPart) => {
			console.log("Received data part:", dataPart);

			if (dataPart.type === "data-metadata" && !hasRedirectedRef.current) {
				const { chatId: newChatId, title } = dataPart.data as {
					chatId: string;
					title: string;
				};

				if (newChatId && !chatIdFromUrl) {
					hasRedirectedRef.current = true;

					// Store for later, but don't change effectiveChatId yet
					streamingChatIdRef.current = newChatId;

					// Add new chat to sidebar
					const newChat: ChatSummary = {
						id: newChatId,
						title: title || "New Chat",
						created_at: new Date().toISOString(),
					};

					queryClient.setQueryData<ChatSummary[]>(["chats"], (old = []) => {
						if (old.some((chat) => chat.id === newChatId)) return old;
						return [newChat, ...old];
					});

					// Update URL
					window.history.replaceState(null, "", `/chat/${newChatId}`);
				}
			}
		},
		onFinish: () => {
			setIsStreaming(false);
		},
		onError: (err) => {
			console.error("Chat error:", err);
			setIsStreaming(false);
			toast.error("Something went wrong. Please try again.");
		},
	});

	// Set initial messages when they load (for existing chats)
	useEffect(() => {
		if (initialMessages && initialMessages.length > 0 && chatIdFromUrl) {
			setMessages(initialMessages);
		}
	}, [initialMessages, setMessages, chatIdFromUrl]);

	const previousUrlRef = useRef(chatIdFromUrl);
	useEffect(() => {
		const urlChanged = previousUrlRef.current !== chatIdFromUrl;

		if (urlChanged && !hasRedirectedRef.current) {
			streamingChatIdRef.current = null;

			if (!chatIdFromUrl) {
				setMessages([]);
			}
		}

		if (urlChanged) {
			hasRedirectedRef.current = false;
		}

		previousUrlRef.current = chatIdFromUrl;
	}, [chatIdFromUrl, setMessages]);

	// Claim conversation when user signs in with existing messages
	useEffect(() => {
		const claimMessages = async () => {
			if (
				isLoaded &&
				isSignedIn &&
				!chatIdFromUrl &&
				chatMessages.length > 0 &&
				!hasClaimedRef.current &&
				!isStreaming
			) {
				hasClaimedRef.current = true;

				try {
					const messagesToClaim = chatMessages.map((msg) => ({
						role: msg.role as "user" | "assistant",
						content: msg.parts
							.filter((p) => p.type === "text")
							.map((p) => (p.type === "text" ? p.text : ""))
							.join(""),
					}));

					const newChat = await claimConversation.mutateAsync(messagesToClaim);
					router.replace(`/chat/${newChat.id}`);
				} catch (error) {
					console.error("Failed to claim conversation:", error);
				}
			}
		};

		claimMessages();
	}, [isLoaded, isSignedIn, chatIdFromUrl, chatMessages.length, isStreaming]);
	const isFirstResponse = chatMessages.length === 0 && !isLoadingMessages;
	const activeCategoryData = suggestionGroups.find(
		(group) => group.label === activeCategory
	);
	const showCategorySuggestions = activeCategory !== "";

	const handleSendMessage = async () => {
		console.log("Sending message with effectiveChatId:", effectiveChatId);
		if (!hasCredits) {
			toast.error(
				"You've reached your free message limit. Sign up to continue!"
			);
			return;
		}

		if (!prompt.trim() || isStreaming) return;

		incrementMessageCount();
		const messageContent = prompt;
		setPrompt("");
		setFiles([]);
		setIsStreaming(true);
		hasRedirectedRef.current = false;

		try {
			await sendMessage({ text: messageContent });
		} catch (e) {
			console.error(e);
			toast.error("Failed to send message. Please try again.");
			setIsStreaming(false);
		}
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			const newFiles = Array.from(event.target.files);
			setFiles((prev) => [...prev, ...newFiles]);
		}
	};

	const handleRemoveFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
		if (uploadInputRef?.current) {
			uploadInputRef.current.value = "";
		}
	};

	const FileListItem = ({
		file,
		dismiss = true,
		index,
	}: {
		file: File;
		dismiss?: boolean;
		index: number;
	}) => (
		<div className="bg-muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
			<Paperclip className="size-4" />
			<span className="max-w-[120px] truncate">{file.name}</span>
			{dismiss && (
				<button
					onClick={() => handleRemoveFile(index)}
					className="hover:bg-secondary/50 rounded-full p-1"
				>
					<X className="size-4" />
				</button>
			)}
		</div>
	);

	// Auto-scroll to bottom
	useEffect(() => {
		if (!containerRef.current || !bottomRef.current) return;
		containerRef.current.scrollTo({
			top: containerRef.current.scrollHeight,
			behavior: "smooth",
		});
	}, [chatMessages.length]);

	// Show loading state while fetching messages for existing chat
	if (isLoadingMessages && chatIdFromUrl && isSignedIn) {
		return (
			<div className="flex h-full items-center justify-center">
				<PromptLoader variant="pulse-dot" />
			</div>
		);
	}

	return (
		<div className="mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center space-y-4 lg:p-4">
			<div className="h-10" />
			<ChatContainer
				className={cn("relative w-full flex-1 space-y-4 pe-2 pt-10 md:pt-0", {
					hidden: isFirstResponse,
				})}
				ref={containerRef}
				scrollToRef={bottomRef}
			>
				{chatMessages.map((message) => {
					const isAssistant = message.role === "assistant";

					const textContent = message.parts
						.filter((part) => part.type === "text")
						.map((part) => (part.type === "text" ? part.text : ""))
						.join("");

					return (
						<Message
							key={message.id}
							className={isAssistant ? "justify-start" : "justify-end"}
						>
							<div
								className={cn("max-w-[85%] flex-1 sm:max-w-[75%]", {
									"justify-end text-end": !isAssistant,
								})}
							>
								{isAssistant ? (
									<div className="space-y-2">
										<div className="bg-muted text-foreground prose rounded-lg border p-4">
											<Markdown className={"space-y-4"}>{textContent}</Markdown>
										</div>
										<MessageActions className="flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
											<MessageAction tooltip="Copy" delayDuration={100}>
												<Button
													variant="ghost"
													size="icon"
													className="rounded-full"
													onClick={() => {
														navigator.clipboard.writeText(textContent);
														toast.success("Copied to clipboard");
													}}
												>
													<CopyIcon />
												</Button>
											</MessageAction>
										</MessageActions>
									</div>
								) : (
									<MessageContent className="bg-primary text-primary-foreground inline-flex text-start">
										{textContent}
									</MessageContent>
								)}
							</div>
						</Message>
					);
				})}

				{isStreaming && (
					<div className="ps-2">
						<PromptLoader variant="pulse-dot" />
					</div>
				)}

				<div ref={bottomRef} />
			</ChatContainer>

			<div className="fixed right-4 bottom-4">
				<PromptScrollButton
					containerRef={containerRef}
					scrollRef={bottomRef}
					className="shadow-sm"
				/>
			</div>

			{isFirstResponse && (
				<div className="mb-10">
					<div className="mx-auto -mt-36 hidden w-72 mask-b-from-100% mask-radial-[50%_50%] mask-radial-from-0% md:block">
						<Lottie
							className="w-full"
							animationData={planeAnimation}
							loop
							autoplay
						/>
					</div>

					<h1 className="text-center text-2xl leading-normal font-medium lg:text-4xl">
						Good Morning, <span className="text-primary">Name</span> <br />
						How Can I
						<span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
							{" "}
							Assist You Today?
						</span>
					</h1>
				</div>
			)}

			<div className="bg-primary/10 w-full rounded-2xl p-1 pt-0">
				<div className="flex gap-2 px-4 py-2 text-xs">
					{isGuest ? (
						<>
							{remainingCredits} free messages remaining <span>&bull;</span>{" "}
							Sign up for unlimited
						</>
					) : (
						<>
							Use our faster AI on Pro Plan <span>&bull;</span>
							<AIUpgradePricingModal>
								<Link href="#" className="hover:underline">
									Upgrade
								</Link>
							</AIUpgradePricingModal>
						</>
					)}
				</div>

				<Input
					value={prompt}
					onValueChange={setPrompt}
					onSubmit={handleSendMessage}
					className="w-full overflow-hidden border-0 p-0 shadow-none"
				>
					{files.length > 0 && (
						<div className="flex flex-wrap gap-2 pb-2">
							{files.map((file, index) => (
								<FileListItem key={index} index={index} file={file} />
							))}
						</div>
					)}

					<PromptInputTextarea
						placeholder={
							hasCredits
								? "Ask me anything..."
								: "Sign up to continue chatting..."
						}
						className="min-h-auto p-4"
						disabled={!hasCredits || isStreaming}
					/>

					<PromptInputActions className="flex items-center justify-between gap-2 p-3">
						<div className="flex items-center gap-2">
							<PromptInputAction tooltip="Attach files">
								<label
									htmlFor="file-upload"
									className="hover:bg-secondary-foreground/10 flex size-8 cursor-pointer items-center justify-center rounded-2xl"
								>
									<input
										type="file"
										multiple
										onChange={handleFileChange}
										className="hidden"
										id="file-upload"
										disabled={!hasCredits || isStreaming}
										ref={uploadInputRef}
									/>
									<Paperclip className="text-primary size-5" />
								</label>
							</PromptInputAction>
						</div>

						<div className="flex gap-2">
							<PromptInputAction tooltip="Voice input">
								<Button
									variant="outline"
									size="icon"
									className="size-9 rounded-full"
									disabled={!hasCredits || isStreaming}
								>
									<MicIcon size={18} />
								</Button>
							</PromptInputAction>
							<PromptInputAction
								tooltip={isStreaming ? "Generating..." : "Send message"}
							>
								<Button
									variant="default"
									size="icon"
									className="size-8 rounded-full"
									onClick={handleSendMessage}
									disabled={!prompt.trim() || !hasCredits || isStreaming}
								>
									{isStreaming ? <SquareIcon /> : <ArrowUpIcon />}
								</Button>
							</PromptInputAction>
						</div>
					</PromptInputActions>
				</Input>
			</div>

			{isFirstResponse && (
				<div className="relative flex w-full flex-col items-center justify-center space-y-2">
					<div className="absolute top-0 left-0 h-[70px] w-full">
						{showCategorySuggestions ? (
							<div className="flex w-full flex-col space-y-1">
								{activeCategoryData?.items.map((suggestion) => (
									<Suggestion
										key={suggestion}
										highlight={activeCategoryData.highlight}
										onClick={() => {
											setPrompt(suggestion);
											setActiveCategory("");
										}}
									>
										{suggestion}
									</Suggestion>
								))}
							</div>
						) : (
							<div className="relative flex w-full flex-wrap items-stretch justify-start gap-2">
								{suggestionGroups.map((suggestion) => (
									<Suggestion
										key={suggestion.label}
										size="sm"
										onClick={() => {
											setActiveCategory(suggestion.label);
											setPrompt("");
										}}
										className="capitalize"
									>
										{suggestion.icon && <suggestion.icon />}
										{suggestion.label}
									</Suggestion>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
