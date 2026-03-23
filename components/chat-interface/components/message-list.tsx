"use client";

import { ChatContainer } from "@/components/ui/custom/prompt/chat-container";
import { PromptLoader } from "@/components/ui/custom/prompt/loader";
import { Message, MessageContent } from "@/components/ui/custom/prompt/message";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import { memo, type RefObject } from "react";
import type { UIPart } from "@/types/chat";
import { AssistantMessage } from "./assistant-message";

interface MessageListProps {
	messages: UIMessage[];
	isStreaming: boolean;
	isFirstResponse: boolean;
	containerRef: RefObject<HTMLDivElement | null>;
	bottomRef: RefObject<HTMLDivElement | null>;
	onRegenerate: () => void;
	onSelectFollowUp: (text: string) => void;
}

export const MessageList = memo(function MessageList({
	messages,
	isStreaming,
	isFirstResponse,
	containerRef,
	bottomRef,
	onRegenerate,
	onSelectFollowUp,
}: MessageListProps) {
	const showStreamingLoader =
		isStreaming &&
		(messages.length === 0 || messages[messages.length - 1]?.role === "user");

	return (
		<ChatContainer
			className={cn("relative w-full flex-1 pt-14 md:pt-16", {
				hidden: isFirstResponse,
			})}
			ref={containerRef}
			scrollToRef={bottomRef}
		>
			{/* Inner wrapper — constrains content width while scrollbar stays at screen edge */}
			<div className="mx-auto w-full max-w-3xl space-y-5 px-4 pb-6">
				{messages.map((message, index) => {
					const isAssistant = message.role === "assistant";
					const isLastMessage = index === messages.length - 1;
					const isMessageStreaming = isStreaming && isLastMessage;

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
								className={cn("group max-w-[85%] flex-1 sm:max-w-[75%]", {
									"justify-end text-end": !isAssistant,
								})}
							>
								{isAssistant ? (
									<AssistantMessage
										parts={message.parts as UIPart[]}
										isStreaming={isMessageStreaming}
										onRegenerate={isLastMessage ? onRegenerate : undefined}
										showFollowUps={isLastMessage && !isStreaming}
										onSelectFollowUp={onSelectFollowUp}
									/>
								) : (
									<MessageContent className="bg-primary text-primary-foreground inline-flex rounded-xl px-4 py-2.5 text-sm text-start">
										{textContent}
									</MessageContent>
								)}
							</div>
						</Message>
					);
				})}

				{showStreamingLoader && (
					<div className="ps-2">
						<PromptLoader variant="pulse-dot" />
					</div>
				)}
			</div>
		</ChatContainer>
	);
});
