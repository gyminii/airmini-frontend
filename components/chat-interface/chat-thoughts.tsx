"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type Thought = {
	id: string;
	content: string;
	status: "pending" | "complete" | "error";
};

interface AIChatThoughtsProps {
	thoughts: Thought[];
	isThinking: boolean;
}

export function AIChatThoughts({ thoughts, isThinking }: AIChatThoughtsProps) {
	if (thoughts.length === 0) return null;

	return (
		<motion.div
			initial={{ opacity: 0, height: 0 }}
			animate={{ opacity: 1, height: "auto" }}
			exit={{ opacity: 0, height: 0 }}
			className="mb-2 overflow-hidden rounded-lg border bg-muted/50 p-3"
		>
			<div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
				{isThinking ? (
					<Loader2 className="h-3 w-3 animate-spin" />
				) : (
					<CheckCircle2 className="h-3 w-3 text-green-500" />
				)}
				<span>Thinking</span>
			</div>

			<div className="space-y-1">
				<AnimatePresence mode="popLayout">
					{thoughts.map((thought) => (
						<motion.div
							key={thought.id}
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 10 }}
							className={cn(
								"flex items-center gap-2 text-sm",
								thought.status === "complete" && "text-muted-foreground",
								thought.status === "error" && "text-destructive"
							)}
						>
							{thought.status === "pending" && (
								<Loader2 className="h-3 w-3 shrink-0 animate-spin" />
							)}
							{thought.status === "complete" && (
								<CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" />
							)}
							{thought.status === "error" && (
								<AlertCircle className="h-3 w-3 shrink-0" />
							)}
							<span>{thought.content}</span>
						</motion.div>
					))}
				</AnimatePresence>
			</div>
		</motion.div>
	);
}
