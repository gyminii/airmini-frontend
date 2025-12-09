import {
	BookOpen,
	Brain,
	CheckCircle2,
	FileUser,
	Globe,
	Hotel,
	Plane,
	Shield,
	Sparkles,
} from "lucide-react";
import type { ThoughtPhase, ThoughtRenderMode } from "@/types/chat";
import type { SuggestionGroup } from "@/components/chat-interface/types";

// CURRENT RENDER MODE
export const CURRENT_THOUGHT_MODE: ThoughtRenderMode = "grouped_above";

// THOUGHT PHASE ICONS
export const THOUGHT_PHASE_ICONS: Record<ThoughtPhase, React.ReactNode> = {
	analysis: <Brain className="size-4" />,
	search: <Globe className="size-4" />,
	knowledge: <BookOpen className="size-4" />,
	visa: <Shield className="size-4" />,
	validation: <CheckCircle2 className="size-4" />,
	other: <Sparkles className="size-4" />,
};

// SUGGESTION GROUPS
export const SUGGESTION_GROUPS: SuggestionGroup[] = [
	{
		icon: FileUser,
		label: "Visa Requirements",
		highlight: "Do I need",
		items: [
			"Do I need a visa to travel to Japan from South Korea?",
			"Do I need a visa for a layover in the US?",
			"Do I need a tourist visa for France?",
			"Do I need a transit visa for Dubai?",
		],
	},
	{
		icon: Plane,
		label: "Flight Info",
		highlight: "What are",
		items: [
			"What are the baggage restrictions for international flights?",
			"What are the best times to book cheap flights?",
			"What are the carry-on size limits?",
			"What are the liquids rules for flights?",
		],
	},
	{
		icon: Hotel,
		label: "Accommodation",
		highlight: "Where should",
		items: [
			"Where should I stay in Tokyo for first-time visitors?",
			"Where should I book hotels for the best prices?",
			"Where should I stay near the airport?",
			"Where should I look for vacation rentals?",
		],
	},
	{
		icon: Globe,
		label: "Travel Tips",
		highlight: "What should",
		items: [
			"What should I pack for a 2-week trip to Europe?",
			"What should I know about travel insurance?",
			"What should I do if I lose my passport abroad?",
			"What should I know about currency exchange?",
		],
	},
];
