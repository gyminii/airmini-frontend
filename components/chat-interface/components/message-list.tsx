"use client";

import { ChatContainer } from "@/components/ui/custom/prompt/chat-container";
import { PromptLoader } from "@/components/ui/custom/prompt/loader";
import { Message, MessageContent } from "@/components/ui/custom/prompt/message";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import type { RefObject } from "react";
import type { UIPart } from "@/types/chat";
import { AssistantMessage } from "./assistant-message";

interface MessageListProps {
	messages: UIMessage[];
	isStreaming: boolean;
	isFirstResponse: boolean;
	containerRef: RefObject<HTMLDivElement | null>;
	bottomRef: RefObject<HTMLDivElement | null>;
}

export function MessageList({
	messages,
	isStreaming,
	isFirstResponse,
	containerRef,
	bottomRef,
}: MessageListProps) {
	const showStreamingLoader =
		isStreaming &&
		(messages.length === 0 || messages[messages.length - 1]?.role === "user");

	return (
		<ChatContainer
			className={cn("relative w-full flex-1 space-y-4 pe-2 pt-10 md:pt-0", {
				hidden: isFirstResponse,
			})}
			ref={containerRef}
			scrollToRef={bottomRef}
		>
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
						key={`${message.role}_${index}`}
						className={isAssistant ? "justify-start" : "justify-end"}
					>
						<div
							className={cn("max-w-[85%] flex-1 sm:max-w-[75%]", {
								"justify-end text-end": !isAssistant,
							})}
						>
							{isAssistant ? (
								<AssistantMessage
									parts={message.parts as UIPart[]}
									isStreaming={isMessageStreaming}
								/>
							) : (
								<MessageContent className="bg-primary text-primary-foreground inline-flex text-start">
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

			<div ref={bottomRef} />
		</ChatContainer>
	);
}
