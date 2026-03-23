// components/chat-interface/readme-modal.tsx
"use client";

import React from "react";
import {
	Brain,
	Globe,
	BookOpen,
	Shield,
	CheckCircle2,
	Eye,
	Plane,
} from "lucide-react";
import Image from "next/image";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

// Module-level constant — not recreated on every render
const STEPS = [
	{
		number: "01",
		icon: <Brain className="size-4" />,
		title: "Understands your situation",
		description:
			"Visa type? Permit renewal? Entry requirements? It reads your question and picks the right approach.",
	},
	{
		number: "02",
		icon: <Globe className="size-4" />,
		title: "Fetches live policy data",
		description:
			"For anything that changes frequently — processing times, fee updates, rule changes — it pulls fresh data.",
	},
	{
		number: "03",
		icon: <BookOpen className="size-4" />,
		title: "Searches immigration docs",
		description:
			"Visa categories, permit conditions, immigration guidelines — all pulled from a curated knowledge base.",
	},
	{
		number: "04",
		icon: <Shield className="size-4" />,
		title: "Checks entry requirements",
		description:
			"Tells you exactly what you need to enter or stay in a country based on your passport and destination.",
	},
	{
		number: "05",
		icon: <CheckCircle2 className="size-4" />,
		title: "Verifies before responding",
		description:
			"Makes sure the answer actually matches what you asked before sending it back.",
	},
	{
		number: "06",
		icon: <Eye className="size-4" />,
		title: "You can watch it think",
		description:
			"Each step shows up as it happens — no black box, just the AI doing its thing.",
	},
];

export const ReadMeModal = ({ children }: { children: React.ReactNode }) => {
	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Plane className="size-5 text-primary" />
						How Airmini Works
					</DialogTitle>
					<DialogDescription>
						An AI immigration assistant that tries not to hallucinate.
					</DialogDescription>
				</DialogHeader>

				{/* Disclaimer */}
				<div className="mt-4 overflow-hidden rounded-xl border border-dashed bg-muted/30">
					<div className="flex flex-col sm:flex-row">
						<div className="relative aspect-square w-full shrink-0 sm:w-36">
							<Image
								src="/images/dead_pepe.webp"
								alt=""
								fill
								className="object-cover"
							/>
						</div>
						<div className="flex flex-col justify-center p-4">
							<p className="font-semibold">Heads up</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Built as a learning project. Always verify critical immigration
								details with official sources before making any decisions.
							</p>
						</div>
					</div>
				</div>

				{/* Tech pills */}
				<div className="mt-4 flex flex-wrap gap-2 text-xs">
					<span className="rounded-full bg-muted px-3 py-1.5">LangGraph</span>
					<span className="rounded-full bg-muted px-3 py-1.5">RAG Pipeline</span>
					<span className="rounded-full bg-muted px-3 py-1.5">Multi-source routing</span>
					<span className="rounded-full bg-muted px-3 py-1.5">Visa APIs</span>
				</div>

				{/* Steps */}
				<div className="mt-6 space-y-1">
					{STEPS.map((step) => (
						<div
							key={step.number}
							className="flex gap-3 p-3"
						>
							<div className="mt-0.5 flex shrink-0 items-start gap-2 text-primary">
								{step.icon}
							</div>
							<div>
								<p className="text-xs font-medium tabular-nums text-muted-foreground/60">
									{step.number}
								</p>
								<h3 className="font-semibold leading-snug">{step.title}</h3>
								<p className="mt-0.5 text-sm text-muted-foreground">
									{step.description}
								</p>
							</div>
						</div>
					))}
				</div>

				<p className="mt-4 text-center text-xs text-muted-foreground">
					Built by Tyler
				</p>
			</DialogContent>
		</Dialog>
	);
};
