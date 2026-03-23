"use client";

import { Button } from "@/components/ui/button";
import {
	Input,
	PromptInputAction,
	PromptInputActions,
	PromptInputTextarea,
} from "@/components/ui/custom/prompt/input";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SendHorizontal, SquareIcon } from "lucide-react";
import { TripContextBadge, TripContextDialog } from "../trip-context-dialog";
import { TripContext } from "@/types/chat";

interface ChatInputProps {
	prompt: string;
	onPromptChange: (value: string) => void;
	onSubmit: () => void;
	isStreaming: boolean;
	hasCredits: boolean;
	isGuest: boolean;
	resetAt: string | null;
	remainingCredits: number;
	guestLimit: number;
	tripContext: TripContext | null;
	onTripContextChange: (context: TripContext | null) => void;
}

function formatResetTime(isoString: string) {
	return new Date(isoString).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function ChatInput({
	prompt,
	onPromptChange,
	onSubmit,
	isStreaming,
	hasCredits,
	isGuest,
	remainingCredits,
	guestLimit,
	tripContext,
	resetAt,
	onTripContextChange,
}: ChatInputProps) {
	const hasTripContext =
		tripContext &&
		(tripContext.origin_country_code ||
			tripContext.origin_city_or_airport ||
			tripContext.destination_country_code ||
			tripContext.destination_city_or_airport);
	const isLimitReached = remainingCredits === 0;
	return (
		<div className="bg-muted w-full rounded-xl p-1 pt-0 shadow-sm">
			<div
				className={cn(
					"flex gap-2 px-4 py-1.5 text-xs",
					isLimitReached ? "text-destructive" : "text-muted-foreground/80"
				)}
			>
				{isGuest ? (
					remainingCredits > 0 ? (
						<>{remainingCredits} of {guestLimit} free messages remaining &mdash; sign in for more</>
					) : (
						<>Free limit reached{resetAt ? <> &mdash; resets at {formatResetTime(resetAt)}</> : null} &mdash; sign in for more messages</>
					)
				) : remainingCredits > 0 ? (
					<>{remainingCredits} messages remaining this window</>
				) : (
					<>Limit reached &mdash; resets at {resetAt && formatResetTime(resetAt)}</>
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
							? "Ask about visas, entry requirements, permits..."
							: "You've hit your current limit. Please wait for it to reset."
					}
					className="min-h-0 px-4 py-3 text-sm disabled:cursor-not-allowed"
					disabled={!hasCredits || isStreaming}
				/>

				<PromptInputActions className="flex items-center justify-end gap-2 px-3 pb-2 pt-1">
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
								className="h-9 rounded-md px-3"
								aria-label={isStreaming ? "Stop generating" : "Send message"}
								onClick={onSubmit}
								disabled={!prompt.trim() || !hasCredits || isStreaming}
							>
								{isStreaming ? <SquareIcon className="size-4" /> : <SendHorizontal className="size-4" />}
							</Button>
						</PromptInputAction>
					</div>
				</PromptInputActions>
			</Input>
		</div>
	);
}
