import type { UIMessage } from "ai";

export type AirminiDataParts = {
	thought: ThoughtData;
};

export type AirminiUIMessage = UIMessage<undefined, AirminiDataParts>;

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

export type ThoughtStep = {
	id: string;
	content: string;
	phase: ThoughtPhase;
	status: "pending" | "complete";
};
