// components/chat-interface/readme-modal.tsx
"use client";

import React from "react";
import {
	Brain,
	Globe,
	BookOpen,
	Shield,
	CheckCircle2,
	MessageSquare,
	Sparkles,
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

export const ReadMeModal = ({ children }: { children: React.ReactNode }) => {
	const steps = [
		{
			icon: <Brain className="size-5" />,
			title: "Figures out what you need",
			description:
				"Visa stuff? Baggage limits? Flight info? It reads your question and picks the right approach.",
		},
		{
			icon: <Globe className="size-5" />,
			title: "Hits the web if needed",
			description:
				"For anything time-sensitive like prices or policy changes, it grabs fresh data from the internet.",
		},
		{
			icon: <BookOpen className="size-5" />,
			title: "Digs through the docs",
			description:
				"TSA rules, airline policies, travel guidelines — all pulled from a curated knowledge base.",
		},
		{
			icon: <Shield className="size-5" />,
			title: "Checks visa requirements",
			description:
				"Tells you what you need to enter a country based on your passport and destination.",
		},
		{
			icon: <CheckCircle2 className="size-5" />,
			title: "Double-checks everything",
			description:
				"Makes sure the answer actually matches what you asked before sending it back.",
		},
	];

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<div className="rounded-lg bg-primary/10 p-2 text-primary">
							<Sparkles className="size-5" />
						</div>
						<DialogTitle>How Airmini Works</DialogTitle>
					</div>
					<DialogDescription>
						An AI travel assistant that tries not to hallucinate.
					</DialogDescription>
				</DialogHeader>

				{/* Disclaimer */}
				<div className="mt-4 overflow-hidden rounded-xl border border-dashed bg-muted/30">
					<div className="flex flex-col sm:flex-row">
						<div className="relative aspect-square w-full sm:w-36 shrink-0">
							<Image
								src="/images/dead_pepe.webp"
								alt="dead pepe"
								fill
								className="object-cover"
							/>
						</div>
						<div className="flex flex-col justify-center p-4">
							<p className="font-medium">Heads up</p>
							<p className="mt-1 text-sm text-muted-foreground">
								This isn&apos;t trying to be ChatGPT. It&apos;s a side project
								to learn how RAG pipelines and LLM orchestration actually work.
								More playground than product.
							</p>
						</div>
					</div>
				</div>

				{/* Tech pills */}
				<div className="mt-4 flex flex-wrap gap-2 text-xs">
					<span className="rounded-full bg-muted px-3 py-1.5">LangGraph</span>
					<span className="rounded-full bg-muted px-3 py-1.5">
						RAG Pipeline
					</span>
					<span className="rounded-full bg-muted px-3 py-1.5">
						Multi-source routing
					</span>
					<span className="rounded-full bg-muted px-3 py-1.5">Visa APIs</span>
				</div>

				{/* Steps */}
				<div className="mt-6 space-y-1">
					{steps.map((step, index) => (
						<div
							key={index}
							className="flex gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
						>
							<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
								{step.icon}
							</div>
							<div>
								<h3 className="font-medium">{step.title}</h3>
								<p className="text-sm text-muted-foreground">
									{step.description}
								</p>
							</div>
						</div>
					))}
				</div>

				{/* Watch it think */}
				<div className="mt-6 flex gap-3 rounded-lg bg-muted/50 p-4">
					<MessageSquare className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
					<div>
						<p className="text-sm font-medium">You can watch it think</p>
						<p className="text-sm text-muted-foreground">
							Each step shows up as it happens — no black box, just the AI doing
							its thing.
						</p>
					</div>
				</div>

				<p className="mt-4 text-center text-xs text-muted-foreground">
					Built by Tyler • LangGraph + RAG
				</p>
			</DialogContent>
		</Dialog>
	);
};
