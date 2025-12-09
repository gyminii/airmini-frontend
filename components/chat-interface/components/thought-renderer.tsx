"use client";

import {
	ChainOfThought,
	ChainOfThoughtStep,
	ChainOfThoughtTrigger,
} from "@/components/ui/chain-of-thought";
import type { ThoughtItem } from "@/types/chat";
import { getThoughtIcon } from "@/utils/utils";
import { Loader2 } from "lucide-react";

interface ThoughtRendererProps {
	thoughts: ThoughtItem[];
	isStreaming: boolean;
}

export function ThoughtRenderer({
	thoughts,
	isStreaming,
}: ThoughtRendererProps) {
	if (!thoughts.length) return null;

	return (
		<ChainOfThought>
			{thoughts.map((thought) => (
				<ChainOfThoughtStep key={thought.id}>
					<ChainOfThoughtTrigger
						leftIcon={
							isStreaming && thought.status === "pending" ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								getThoughtIcon(thought.phase)
							)
						}
					>
						{thought.content}
					</ChainOfThoughtTrigger>
				</ChainOfThoughtStep>
			))}
		</ChainOfThought>
	);
}
