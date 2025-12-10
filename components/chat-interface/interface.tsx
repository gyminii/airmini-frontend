"use client";

import { PromptScrollButton } from "@/components/ui/custom/prompt/scroll-button";
import {
	ChatInput,
	MessageList,
	SuggestionPanel,
	WelcomeScreen,
} from "./components";
import { useChatInterface } from "@/hooks/use-chat-interface";
import { InterfaceProps } from "./types";

export default function Interface({
	isNewChat,
	chatData,
	credits,
	tripContext: initialTripContext,
}: InterfaceProps) {
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
		messages,
		isFirstResponse,
		handleSendMessage,
		handleSelectSuggestion,
		handleSelectCategory,
	} = useChatInterface({
		chatId: chatData.chat_id,
		initialMessages: chatData.messages,
		credits,
		isNewChat,
		initialTripContext,
	});

	return (
		<div className="mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center space-y-4 lg:p-4">
			<div className="h-10" />

			<MessageList
				messages={messages}
				isStreaming={isStreaming}
				isFirstResponse={isFirstResponse}
				containerRef={containerRef}
				bottomRef={bottomRef}
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
