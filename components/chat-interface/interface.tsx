"use client";

import {
	ChainOfThought,
	ChainOfThoughtStep,
	ChainOfThoughtTrigger,
} from "@/components/ui/chain-of-thought";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { CopyIcon } from "@radix-ui/react-icons";
import { DefaultChatTransport } from "ai";
import Lottie from "lottie-react";
import {
	TripContext,
	TripContextDialog,
	TripContextBadge,
} from "./trip-context-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
	ArrowUpIcon,
	BookOpen,
	Brain,
	CheckCircle2,
	FileUser,
	Globe,
	Hotel,
	Loader2,
	Plane,
	Shield,
	Sparkles,
	SquareIcon,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";

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

import { useCredits } from "@/hooks/use-credits";
import { useSafeUser } from "@/hooks/use-safe-user";
import { invalidateChats } from "@/lib/actions/chat";
import { toast } from "sonner";
import planeAnimation from "../../data/Loading 40 _ Paperplane.json";
import { AirminiUIMessage } from "../../types/chat-message";
import { ReadMeModal } from "./readme-modal";

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

// -----------------------------
// STRICT TYPES
// -----------------------------
type TextPart = {
	type: "text";
	text: string;
};

type ThoughtPhase =
	| "analysis"
	| "search"
	| "knowledge"
	| "visa"
	| "validation"
	| "other";

type ThoughtData = {
	content: string;
	phase?: ThoughtPhase;
	status: "pending" | "complete";
};

type ThoughtPart = {
	type: "data-thought";
	data: ThoughtData;
};

type UIPart = TextPart | ThoughtPart;

type ThoughtItem = {
	id: string;
	content: string;
	phase: ThoughtPhase;
	status: "pending" | "complete";
};

// -----------------------------
// THOUGHT PHASE ICONS
// -----------------------------
const THOUGHT_PHASE_ICONS: Record<ThoughtPhase, React.ReactNode> = {
	analysis: <Brain className="size-4" />,
	search: <Globe className="size-4" />,
	knowledge: <BookOpen className="size-4" />,
	visa: <Shield className="size-4" />,
	validation: <CheckCircle2 className="size-4" />,
	other: <Sparkles className="size-4" />,
};

function getThoughtIcon(phase: ThoughtPhase): React.ReactNode {
	return THOUGHT_PHASE_ICONS[phase] || THOUGHT_PHASE_ICONS.other;
}

// -----------------------------
// THOUGHT MODE ENUM
// -----------------------------
const THOUGHT_RENDER_MODE = {
	inline_after_text: "inline_after_text",
	inline_before_text: "inline_before_text",
	grouped_above: "grouped_above",
	grouped_below: "grouped_below",
} as const;

type ThoughtRenderMode = keyof typeof THOUGHT_RENDER_MODE;

const CURRENT_MODE: ThoughtRenderMode = "grouped_above";

function extractThoughtSteps(parts: UIPart[]): ThoughtItem[] {
	return parts
		.filter((p): p is ThoughtPart => p.type === "data-thought")
		.map((p, i) => ({
			id: `thought-${i}`,
			content: p.data.content,
			phase: p.data.phase || "other",
			status: p.data.status,
		}));
}

function extractTextSegments(parts: UIPart[]): string[] {
	return parts
		.filter((p): p is TextPart => p.type === "text")
		.map((p) => p.text);
}

export default function Interface({
	isNewChat,
	chatData,
}: {
	chatData: { chat_id: string; messages: AirminiUIMessage[] };
	isNewChat?: boolean;
}) {
	const { chat_id } = chatData;
	const [prompt, setPrompt] = useState("");
	const [activeCategory, setActiveCategory] = useState("");
	const containerRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const { user } = useSafeUser();

	const userName = user?.fullName || user?.firstName;

	const { hasCredits, remainingCredits, isGuest } = useCredits();
	const [isStreaming, setIsStreaming] = useState(false);

	const [tripContext, setTripContext] = useState<TripContext | null>(null);

	const transport = useMemo(
		() =>
			new DefaultChatTransport({
				api: "/api/chat",
			}),
		[]
	);

	const { messages: chatMessages, sendMessage } = useChat({
		id: chat_id,
		messages: chatData.messages,
		transport,
		onFinish: async () => {
			// Revalidate server cache instead of React Query
			await invalidateChats();
			setIsStreaming(false);
		},
		onError: (err) => {
			console.error("Chat error:", err);
			setIsStreaming(false);
			toast.error("Something went wrong. Please try again.");
		},
	});

	const isFirstResponse = chatMessages.length === 0;
	const activeCategoryData = suggestionGroups.find(
		(group) => group.label === activeCategory
	);
	const showCategorySuggestions = activeCategory !== "";

	const handleSendMessage = async () => {
		if (!hasCredits) {
			toast.error(
				"You've reached your free message limit. Sign up to continue!"
			);
			return;
		}

		if (!prompt.trim() || isStreaming) return;

		if (isNewChat) {
			window.history.replaceState(null, "", `/chat/${chat_id}`);
		}

		const messageContent = prompt;

		setPrompt("");
		setIsStreaming(true);

		try {
			await sendMessage(
				{
					text: messageContent,
				},
				{
					body: tripContext ? { tripContext } : undefined,
				}
			);
		} catch (err) {
			console.error("sendMessage error:", err);
			toast.error("Failed to send message");
			setIsStreaming(false);
		}
	};

	useEffect(() => {
		if (!containerRef.current || !bottomRef.current) return;
		containerRef.current.scrollTo({
			top: containerRef.current.scrollHeight,
			behavior: "smooth",
		});
	}, [chatMessages.length]);

	function renderThoughts(
		thoughts: ThoughtItem[],
		isCurrentlyStreaming: boolean
	) {
		if (!thoughts.length) return null;

		return (
			<ChainOfThought>
				{thoughts.map((t) => (
					<ChainOfThoughtStep key={t.id}>
						<ChainOfThoughtTrigger
							leftIcon={
								isCurrentlyStreaming && t.status === "pending" ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									getThoughtIcon(t.phase)
								)
							}
						>
							{t.content}
						</ChainOfThoughtTrigger>
					</ChainOfThoughtStep>
				))}
			</ChainOfThought>
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
				{chatMessages.map((message, messageIndex) => {
					const isAssistant = message.role === "assistant";
					const isLastMessage = messageIndex === chatMessages.length - 1;

					const textContent = message.parts
						.filter((part) => part.type === "text")
						.map((part) => (part.type === "text" ? part.text : ""))
						.join("");
					return (
						<Message
							key={`${message.role}_${messageIndex}`}
							className={isAssistant ? "justify-start" : "justify-end"}
						>
							<div
								className={cn("max-w-[85%] flex-1 sm:max-w-[75%]", {
									"justify-end text-end": !isAssistant,
								})}
							>
								{isAssistant ? (
									<div className="space-y-3">
										{(() => {
											const parts = message.parts as UIPart[];
											const textSegments = extractTextSegments(parts);
											const thoughts = extractThoughtSteps(parts);
											const isMessageStreaming = isStreaming && isLastMessage;

											switch (CURRENT_MODE) {
												case "inline_before_text":
													return (
														<>
															{renderThoughts(thoughts, isMessageStreaming)}
															{textSegments.map((text, i) => (
																<div
																	key={i}
																	className="bg-muted text-foreground prose rounded-lg border p-4"
																>
																	<Markdown className="space-y-4">
																		{text}
																	</Markdown>
																</div>
															))}
														</>
													);

												case "inline_after_text":
													return (
														<>
															{textSegments.map((text, i) => (
																<div
																	key={i}
																	className="bg-muted text-foreground prose rounded-lg border p-4"
																>
																	<Markdown className="space-y-4">
																		{text}
																	</Markdown>
																</div>
															))}
															{renderThoughts(thoughts, isMessageStreaming)}
														</>
													);

												case "grouped_above":
													return (
														<>
															{renderThoughts(thoughts, isMessageStreaming)}

															{textSegments.length > 0 && (
																<div className="bg-muted text-foreground prose rounded-lg border p-4">
																	<Markdown className="space-y-4">
																		{textSegments.join("")}
																	</Markdown>
																</div>
															)}
														</>
													);

												case "grouped_below":
													return (
														<>
															{textSegments.length > 0 && (
																<div className="bg-muted text-foreground prose rounded-lg border p-4">
																	<Markdown className="space-y-4">
																		{textSegments.join("")}
																	</Markdown>
																</div>
															)}
															{renderThoughts(thoughts, isMessageStreaming)}
														</>
													);

												default:
													return null;
											}
										})()}

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

				{isStreaming &&
					(chatMessages.length === 0 ||
						chatMessages[chatMessages.length - 1]?.role === "user") && (
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
						Good Morning
						{user && <span className="text-primary">{` ${userName}`}</span>}
						<br />
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
							<ReadMeModal>
								<Link href="#" className="hover:underline">
									Upgrade
								</Link>
							</ReadMeModal>
						</>
					)}
				</div>

				<Input
					value={prompt}
					onValueChange={setPrompt}
					onSubmit={handleSendMessage}
					className="w-full overflow-hidden border-0 p-0 shadow-none"
				>
					{tripContext && (tripContext.origin || tripContext.destination) && (
						<div className="px-4 pt-2">
							<TripContextBadge
								context={tripContext}
								onClear={() => setTripContext(null)}
							/>
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

					<PromptInputActions className="flex items-center justify-end gap-2 p-3">
						<div className="flex items-center gap-2">
							<TooltipProvider>
								<TripContextDialog
									value={tripContext}
									onChange={setTripContext}
								/>
							</TooltipProvider>
						</div>
						<div className="flex gap-2">
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
