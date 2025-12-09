import {
	UIPart,
	TextPart,
	ThoughtItem,
	ThoughtPart,
	ThoughtPhase,
} from "@/types/chat";
import { THOUGHT_PHASE_ICONS } from "@/lib/constants/chat";

/**
 * Extract thought steps from message parts
 */
export function extractThoughtSteps(parts: UIPart[]): ThoughtItem[] {
	return parts
		.filter((p): p is ThoughtPart => p.type === "data-thought")
		.map((p, i) => ({
			id: `thought-${i}`,
			content: p.data.content,
			phase: p.data.phase || "other",
			status: p.data.status,
		}));
}

/**
 * Extract text segments from message parts
 */
export function extractTextSegments(parts: UIPart[]): string[] {
	return parts
		.filter((p): p is TextPart => p.type === "text")
		.map((p) => p.text);
}

/**
 * Get the appropriate icon for a thought phase
 */
export function getThoughtIcon(phase: ThoughtPhase): React.ReactNode {
	return THOUGHT_PHASE_ICONS[phase] || THOUGHT_PHASE_ICONS.other;
}

/**
 * Extract plain text content from message parts for copying
 */
export function extractTextContent(
	parts: Array<{ type: string; text?: string }>
): string {
	return parts
		.filter((part) => part.type === "text")
		.map((part) => part.text || "")
		.join("");
}
