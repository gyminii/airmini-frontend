"use client";

import { Suggestion } from "@/components/ui/custom/prompt/suggestion";
import { SUGGESTION_GROUPS } from "@/lib/constants/chat";

interface SuggestionPanelProps {
	activeCategory: string;
	onSelectCategory: (category: string) => void;
	onSelectSuggestion: (suggestion: string) => void;
}

export function SuggestionPanel({
	activeCategory,
	onSelectCategory,
	onSelectSuggestion,
}: SuggestionPanelProps) {
	const activeCategoryData = SUGGESTION_GROUPS.find(
		(group) => group.label === activeCategory
	);
	const showCategorySuggestions = activeCategory !== "";

	return (
		<div className="relative flex w-full flex-col items-center justify-center space-y-2">
			<div className="absolute top-0 left-0 h-[70px] w-full">
				{showCategorySuggestions && activeCategoryData ? (
					<div className="flex w-full flex-col space-y-1">
						{activeCategoryData.items.map((suggestion) => (
							<Suggestion
								key={suggestion}
								highlight={activeCategoryData.highlight}
								onClick={() => onSelectSuggestion(suggestion)}
							>
								{suggestion}
							</Suggestion>
						))}
					</div>
				) : (
					<div className="relative flex w-full flex-wrap items-stretch justify-start gap-2">
						{SUGGESTION_GROUPS.map((group) => (
							<Suggestion
								key={group.label}
								size="sm"
								onClick={() => onSelectCategory(group.label)}
								className="capitalize"
							>
								{group.icon && <group.icon />}
								{group.label}
							</Suggestion>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
