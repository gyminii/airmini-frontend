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
import { cn } from "@/lib/utils";

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
		<div className="flex h-full w-full flex-col">
			{/* Toolbar — constrained to max-w-3xl, content-width */}
			<div className="mx-auto flex h-8 w-full max-w-3xl shrink-0 items-center justify-end pe-12 ps-2 md:pe-2 lg:px-4">
				{!isFirstResponse && (
					<div className="animate-in fade-in duration-300">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="size-10 rounded-full"
									onClick={() => exportChatAsText(messages)}
								>
									<DownloadIcon className="size-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Download as text</TooltipContent>
						</Tooltip>
					</div>
				)}
			</div>

			{/* Message list — full viewport width so scrollbar sits at screen edge */}
			<MessageList
				messages={messages}
				isStreaming={isStreaming}
				isFirstResponse={isFirstResponse}
				containerRef={containerRef}
				bottomRef={bottomRef}
				onRegenerate={handleRegenerate}
				onSelectFollowUp={handleSelectSuggestion}
			/>

			<div className="fixed right-6 bottom-6">
				<PromptScrollButton
					containerRef={containerRef}
					scrollRef={bottomRef}
					className="shadow-sm"
				/>
			</div>

			{/* Bottom section — constrained, vertically centered on welcome screen */}
			<div
				className={cn(
					"mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 pb-4 lg:px-4",
					isFirstResponse && "flex-1 justify-center"
				)}
			>
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
		</div>
	);
}
