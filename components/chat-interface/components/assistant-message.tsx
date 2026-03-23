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
							key={i}
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
							key={i}
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

export function AssistantMessage({
	parts,
	isStreaming,
	onRegenerate,
	showFollowUps,
	onSelectFollowUp,
}: AssistantMessageProps) {
	const textSegments = extractTextSegments(parts);
	const thoughts = extractThoughtSteps(parts);
	const textContent = extractTextContent(parts);
	const backendSuggestions = extractSuggestions(parts);
	const followUps = getFollowUps(backendSuggestions, thoughts.map((t) => t.phase));

	return (
		<div className="space-y-3">
			{renderByMode(CURRENT_THOUGHT_MODE, thoughts, textSegments, isStreaming)}

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

				{onRegenerate && (
					<MessageAction tooltip="Regenerate" delayDuration={100}>
						<Button
							variant="ghost"
							size="icon"
							className="rounded-full"
							onClick={onRegenerate}
						>
							<RefreshCw className="size-4" />
						</Button>
					</MessageAction>
				)}
			</MessageActions>

			{showFollowUps && onSelectFollowUp && followUps.length > 0 && (
				<div className="mt-2 flex flex-wrap gap-2">
					{followUps.map((suggestion) => (
						<button
							key={suggestion}
							onClick={() => onSelectFollowUp(suggestion)}
							className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
						>
							{suggestion}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
