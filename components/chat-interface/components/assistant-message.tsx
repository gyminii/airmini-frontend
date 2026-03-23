"use client";

import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/custom/prompt/markdown";
import {
	MessageAction,
	MessageActions,
} from "@/components/ui/custom/prompt/message";
import { CURRENT_THOUGHT_MODE } from "@/lib/constants/chat";
import { getFollowUps } from "@/lib/utils/follow-ups";
import type { ThoughtItem, ThoughtRenderMode, UIPart } from "@/types/chat";
import {
	extractTextContent,
	extractTextSegments,
	extractThoughtSteps,
	extractSuggestions,
} from "@/utils/utils";
import { CopyIcon } from "@radix-ui/react-icons";
import { RefreshCw } from "lucide-react";
import { memo, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { ThoughtRenderer } from "./thought-renderer";

interface AssistantMessageProps {
	parts: UIPart[];
	isStreaming: boolean;
	onRegenerate?: () => void;
	showFollowUps?: boolean;
	onSelectFollowUp?: (text: string) => void;
}

function TextContent({ segments }: { segments: string[] }) {
	if (segments.length === 0) return null;

	return (
		<div className="bg-accent rounded-xl px-4 py-3 prose prose-sm text-foreground">
			<Markdown className="space-y-3">{segments.join("")}</Markdown>
		</div>
	);
}

function renderByMode(
	mode: ThoughtRenderMode,
	thoughts: ThoughtItem[],
	textSegments: string[],
	isStreaming: boolean
) {
	const thoughtsElement = (
		<ThoughtRenderer thoughts={thoughts} isStreaming={isStreaming} />
	);
	const textElement = <TextContent segments={textSegments} />;

	switch (mode) {
		case "inline_before_text":
			return (
				<>
					{thoughtsElement}
					{textSegments.map((text, i) => (
						<div
							key={`seg-${i}-${text.slice(0, 12)}`}
							className="bg-accent rounded-xl px-4 py-3 prose prose-sm text-foreground"
						>
							<Markdown className="space-y-3">{text}</Markdown>
						</div>
					))}
				</>
			);

		case "inline_after_text":
			return (
				<>
					{textSegments.map((text, i) => (
						<div
							key={`seg-${i}-${text.slice(0, 12)}`}
							className="bg-accent rounded-xl px-4 py-3 prose prose-sm text-foreground"
						>
							<Markdown className="space-y-3">{text}</Markdown>
						</div>
					))}
					{thoughtsElement}
				</>
			);

		case "grouped_above":
			return (
				<>
					{thoughtsElement}
					{textElement}
				</>
			);

		case "grouped_below":
			return (
				<>
					{textElement}
					{thoughtsElement}
				</>
			);

		default:
			return null;
	}
}

export const AssistantMessage = memo(function AssistantMessage({
	parts,
	isStreaming,
	onRegenerate,
	showFollowUps,
	onSelectFollowUp,
}: AssistantMessageProps) {
	const textSegments = useMemo(() => extractTextSegments(parts), [parts]);
	const thoughts = useMemo(() => extractThoughtSteps(parts), [parts]);
	const textContent = useMemo(() => extractTextContent(parts), [parts]);
	const backendSuggestions = useMemo(() => extractSuggestions(parts), [parts]);
	const thoughtPhases = useMemo(() => thoughts.map((t) => t.phase), [thoughts]);
	const followUps = useMemo(
		() => getFollowUps(backendSuggestions, thoughtPhases),
		[backendSuggestions, thoughtPhases]
	);

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(textContent);
		toast.success("Copied to clipboard");
	}, [textContent]);

	return (
		<div className="space-y-2">
			{renderByMode(CURRENT_THOUGHT_MODE, thoughts, textSegments, isStreaming)}

			<MessageActions className="flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
				<MessageAction tooltip="Copy" delayDuration={100}>
					<Button
						variant="ghost"
						size="icon"
						className="size-10 rounded-full"
						aria-label="Copy message"
						onClick={handleCopy}
					>
						<CopyIcon />
					</Button>
				</MessageAction>

				{onRegenerate && (
					<MessageAction tooltip="Regenerate" delayDuration={100}>
						<Button
							variant="ghost"
							size="icon"
							className="size-10 rounded-full"
							aria-label="Regenerate response"
							onClick={onRegenerate}
						>
							<RefreshCw className="size-4" />
						</Button>
					</MessageAction>
				)}
			</MessageActions>

			{showFollowUps && onSelectFollowUp && followUps.length > 0 && (
				<div className="mt-3 flex flex-wrap gap-2">
					{followUps.map((suggestion, i) => (
						<button
							key={suggestion}
							onClick={() => onSelectFollowUp(suggestion)}
							style={{ animationDelay: `${i * 60}ms` }}
							className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both min-h-[36px] rounded-full border bg-background px-3 py-1.5 text-sm text-foreground/60 duration-200 transition-colors hover:border-foreground/30 hover:text-foreground"
						>
							{suggestion}
						</button>
					))}
				</div>
			)}
		</div>
	);
});
