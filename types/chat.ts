import type { UIMessage } from "ai";

// THOUGHT TYPES
export type ThoughtPhase =
	| "analysis"
	| "search"
	| "knowledge"
	| "visa"
	| "validation"
	| "other";

export type ThoughtData = {
	content: string;
	phase: ThoughtPhase;
	status: "pending" | "complete";
};

export type ThoughtItem = {
	id: string;
	content: string;
	phase: ThoughtPhase;
	status: "pending" | "complete";
};

// MESSAGE PARTS
export type TextPart = {
	type: "text";
	text: string;
};

export type ThoughtPart = {
	type: "data-thought";
	data: ThoughtData;
};

export type UIPart = TextPart | ThoughtPart;

// AI SDK MESSAGE TYPES
export type AirminiDataParts = {
	thought: ThoughtData;
};

export type AirminiUIMessage = UIMessage<undefined, AirminiDataParts>;

// DATABASE / API TYPES
export interface Message {
	id: string;
	chat_id: string;
	role: "user" | "assistant" | "system";
	content: string;
	created_at: string;
}

export interface ChatSummary {
	id: string;
	title?: string;
	created_at: string;
}

// TRIP CONTEXT
export interface TripContext {
	ui_language: "EN" | "KO";
	answer_language: "EN" | "KO";
	nationality_country_code: string | null;
	origin_country_code: string | null;
	origin_city_or_airport: string | null;
	destination_country_code: string | null;
	destination_city_or_airport: string | null;
	trip_type: "one_way" | "round_trip" | null;
	departure_date: string | null;
	return_date: string | null;
	airline_code: string | null;
	cabin: "economy" | "premium" | "business" | "first" | null;
	purpose: "tourism" | "business" | "family" | "study" | "other" | null;
}

// RENDER MODE
export const THOUGHT_RENDER_MODE = {
	inline_after_text: "inline_after_text",
	inline_before_text: "inline_before_text",
	grouped_above: "grouped_above",
	grouped_below: "grouped_below",
} as const;

export type ThoughtRenderMode = keyof typeof THOUGHT_RENDER_MODE;
