"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PromptScrollButton } from "@/components/ui/custom/prompt/scroll-button";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { DownloadIcon } from "lucide-react";
import {
	ChatInput,
	MessageList,
	SuggestionPanel,
	WelcomeScreen,
} from "./components";
import { useChatInterface } from "@/hooks/use-chat-interface";
import { exportChatAsText } from "@/lib/utils/export-chat";
import { InterfaceProps } from "./types";

export default function Interface({
	isNewChat,
	chatData,
	credits,
	tripContext: initialTripContext,
}: InterfaceProps) {
	const router = useRouter();

	const {
		prompt,
		setPrompt,
		isStreaming,
		tripContext,
		setTripContext,
		activeCategory,
		containerRef,
		bottomRef,
		user,
		userName,
		isGuest,
		hasCredits,
		remainingCredits,
		resetAt,
		guestLimit,
		messages,
		isFirstResponse,
		handleSendMessage,
		handleRegenerate,
		handleSelectSuggestion,
		handleSelectCategory,
	} = useChatInterface({
		chatId: chatData.chat_id,
		initialMessages: chatData.messages,
		credits,
		isNewChat,
		initialTripContext,
	});

	// ⌘K / Ctrl+K → new chat
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const modifier = /mac|iphone|ipad/i.test(navigator.userAgent)
				? e.metaKey
				: e.ctrlKey;
			if (modifier && e.key === "k") {
				e.preventDefault();
				router.push("/chat");
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [router]);

	return (
		<div className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center space-y-3 lg:p-4">
			<div className="flex h-8 w-full items-center justify-end px-2">
				{!isFirstResponse && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="size-8 rounded-full"
								onClick={() => exportChatAsText(messages)}
							>
								<DownloadIcon className="size-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Export chat</TooltipContent>
					</Tooltip>
				)}
			</div>

			<MessageList
				messages={messages}
				isStreaming={isStreaming}
				isFirstResponse={isFirstResponse}
				containerRef={containerRef}
				bottomRef={bottomRef}
				onRegenerate={handleRegenerate}
				onSelectFollowUp={handleSelectSuggestion}
			/>

			<div className="fixed right-4 bottom-4">
				<PromptScrollButton
					containerRef={containerRef}
					scrollRef={bottomRef}
					className="shadow-sm"
				/>
			</div>

			{isFirstResponse && (
				<WelcomeScreen userName={userName} isAuthenticated={!!user} />
			)}

			<ChatInput
				prompt={prompt}
				onPromptChange={setPrompt}
				onSubmit={handleSendMessage}
				isStreaming={isStreaming}
				hasCredits={hasCredits}
				isGuest={isGuest}
				resetAt={resetAt}
				remainingCredits={remainingCredits}
				guestLimit={guestLimit}
				tripContext={tripContext}
				onTripContextChange={setTripContext}
			/>

			{isFirstResponse && (
				<SuggestionPanel
					activeCategory={activeCategory}
					onSelectCategory={handleSelectCategory}
					onSelectSuggestion={handleSelectSuggestion}
				/>
			)}
		</div>
	);
}
