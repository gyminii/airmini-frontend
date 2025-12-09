"use client";

import { Button } from "@/components/ui/button";
import {
	Input,
	PromptInputAction,
	PromptInputActions,
	PromptInputTextarea,
} from "@/components/ui/custom/prompt/input";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ArrowUpIcon, SquareIcon } from "lucide-react";
import {
	TripContext,
	TripContextBadge,
	TripContextDialog,
} from "../trip-context-dialog";

interface ChatInputProps {
	prompt: string;
	onPromptChange: (value: string) => void;
	onSubmit: () => void;
	isStreaming: boolean;
	hasCredits: boolean;
	isGuest: boolean;
	remainingCredits: number;
	tripContext: TripContext | null;
	onTripContextChange: (context: TripContext | null) => void;
}

export function ChatInput({
	prompt,
	onPromptChange,
	onSubmit,
	isStreaming,
	hasCredits,
	isGuest,
	remainingCredits,
	tripContext,
	onTripContextChange,
}: ChatInputProps) {
	const hasTripContext =
		tripContext &&
		(tripContext.origin_country_code ||
			tripContext.origin_city_or_airport ||
			tripContext.destination_country_code ||
			tripContext.destination_city_or_airport);

	return (
		<div className="bg-primary/10 w-full rounded-2xl p-1 pt-0">
			<div className="flex gap-2 px-4 py-2 text-xs">
				{isGuest ? (
					<>Sign up to save your chats and track usage</>
				) : (
					<>{remainingCredits} messages remaining this window</>
				)}
			</div>

			<Input
				value={prompt}
				onValueChange={onPromptChange}
				onSubmit={onSubmit}
				className="w-full overflow-hidden border-0 p-0 shadow-none"
			>
				{hasTripContext && (
					<div className="px-4 pt-2">
						<TripContextBadge
							context={tripContext}
							onClear={() => onTripContextChange(null)}
						/>
					</div>
				)}

				<PromptInputTextarea
					placeholder={
						hasCredits
							? "Ask me anything..."
							: "You've hit your current limit. Please wait for it to reset."
					}
					className="min-h-auto p-4"
					disabled={!hasCredits || isStreaming}
				/>

				<PromptInputActions className="flex items-center justify-end gap-2 p-3">
					<div className="flex items-center gap-2">
						<TooltipProvider>
							<TripContextDialog
								value={tripContext}
								onChange={onTripContextChange}
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
								onClick={onSubmit}
								disabled={!prompt.trim() || !hasCredits || isStreaming}
							>
								{isStreaming ? <SquareIcon /> : <ArrowUpIcon />}
							</Button>
						</PromptInputAction>
					</div>
				</PromptInputActions>
			</Input>
		</div>
	);
}
