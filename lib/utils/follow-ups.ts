import type { ThoughtPhase } from "@/types/chat";

const PHASE_FALLBACKS: Partial<Record<ThoughtPhase, string>> = {
	visa: "What documents do I need for this visa?",
	search: "Are there any recent updates on this?",
	knowledge: "Are there any restrictions I should know about?",
	analysis: "What does this mean for my specific trip?",
	validation: "Should I double-check this with the airline directly?",
};

export function getFollowUps(
	backendSuggestions: string[],
	phases: ThoughtPhase[]
): string[] {
	// Backend-generated suggestions are always preferred
	if (backendSuggestions.length > 0) {
		return backendSuggestions.slice(0, 3);
	}

	// Fallback: one generic suggestion per thought phase seen
	const fallbacks = phases
		.map((p) => PHASE_FALLBACKS[p])
		.filter((s): s is string => Boolean(s));

	return [...new Set(fallbacks)].slice(0, 3);
}
