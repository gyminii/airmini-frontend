// src/ai/types.ts
import type { UIMessage } from "ai";

export type AirminiMessageMetadata = {
	chatId: string;
	title: string | null;
	isNewChat: boolean;
};

/**
 * Data parts we want to stream in addition to plain text.
 *
 * Keys become "data-..." types in the stream protocol:
 * - "thought" -> type: "data-thought"
 * - "source"  -> type: "source" (special-cased by AI SDK)
 */
export type AirminiDataParts = {
	thought: {
		id?: string;
		content: string;
		phase?: "analysis" | "search" | "validation" | "other";
	};

	source: {
		type: "source";
		sourceType: "url" | "document";
		id: string;
		url?: string;
		title?: string;
	};
};

export type AirminiUIMessage = UIMessage<
	AirminiMessageMetadata,
	AirminiDataParts
>;
