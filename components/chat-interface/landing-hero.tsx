"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import { FileUser, Plane, Hotel, Globe } from "lucide-react";
import Link from "next/link";

import planeAnimation from "../../data/Loading 40 _ Paperplane.json";
import { useCredits } from "@/hooks/use-credits";
import { Button } from "@/components/ui/button";
import {
	Input,
	PromptInputAction,
	PromptInputActions,
	PromptInputTextarea,
} from "@/components/ui/custom/prompt/input";
import { Suggestion } from "@/components/ui/custom/prompt/suggestion";
import { ReadMeModal } from "./readme-modal";
import { ArrowUpIcon, MicIcon, Paperclip } from "lucide-react";
import { toast } from "sonner";

const suggestionGroups = [
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

export default function AIChatLanding() {
	const [prompt, setPrompt] = useState("");
	const [activeCategory, setActiveCategory] = useState("");
	const router = useRouter();
	const { hasCredits, remainingCredits, isGuest } = useCredits();

	const activeCategoryData = suggestionGroups.find(
		(g) => g.label === activeCategory
	);
	const showCategorySuggestions = activeCategory !== "";

	const handleStartChat = () => {
		if (!prompt.trim()) {
			toast.error("Please enter a message to start chatting.");
			return;
		}

		if (!hasCredits) {
			toast.error(
				"You've reached your free message limit. Sign up to continue!"
			);
			return;
		}

		// Encode the prompt and pass it to the new chat page
		const encodedPrompt = encodeURIComponent(prompt.trim());
		router.push(`/chat/new?prompt=${encodedPrompt}`);
	};

	return (
		<div className="mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center space-y-4 lg:p-4">
			<div className="h-10" />

			{/* Hero */}
			<div className="mb-10">
				<div className="mx-auto -mt-36 hidden w-72 mask-b-from-100% mask-radial-[50%_50%] mask-radial-from-0% md:block">
					<Lottie
						className="w-full"
						animationData={planeAnimation}
						loop
						autoplay
					/>
				</div>

				<h1 className="text-center text-2xl leading-normal font-medium lg:text-4xl">
					Good Morning, <span className="text-primary">Name</span> <br />
					How Can I
					<span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
						{" "}
						Assist You Today?
					</span>
				</h1>
			</div>

			{/* Credits / upgrade bar */}
			<div className="bg-primary/10 w-full rounded-2xl p-1 pt-0">
				<div className="flex gap-2 px-4 py-2 text-xs">
					{isGuest ? (
						<>
							{remainingCredits} free messages remaining <span>&bull;</span>{" "}
							Sign up for unlimited
						</>
					) : (
						<>
							Use our faster AI on Pro Plan <span>&bull;</span>
							<ReadMeModal>
								<Link href="#" className="hover:underline">
									Upgrade
								</Link>
							</ReadMeModal>
						</>
					)}
				</div>

				<Input
					value={prompt}
					onValueChange={setPrompt}
					onSubmit={handleStartChat}
					className="w-full overflow-hidden border-0 p-0 shadow-none"
				>
					<PromptInputTextarea
						placeholder={
							hasCredits
								? "Ask me anything about your trip..."
								: "Sign up to continue chatting..."
						}
						className="min-h-auto p-4"
						disabled={!hasCredits}
					/>

					<PromptInputActions className="flex items-center justify-between gap-2 p-3">
						<div className="flex items-center gap-2">
							<PromptInputAction tooltip="Attach files">
								<label
									htmlFor="file-upload-landing"
									className="hover:bg-secondary-foreground/10 flex size-8 cursor-pointer items-center justify-center rounded-2xl"
								>
									<input
										type="file"
										multiple
										className="hidden"
										id="file-upload-landing"
										disabled={!hasCredits}
									/>
									<Paperclip className="text-primary size-5" />
								</label>
							</PromptInputAction>
						</div>

						<div className="flex gap-2">
							<PromptInputAction tooltip="Voice input">
								<Button
									variant="outline"
									size="icon"
									className="size-9 rounded-full"
									disabled={!hasCredits}
								>
									<MicIcon size={18} />
								</Button>
							</PromptInputAction>
							<PromptInputAction tooltip="Send message">
								<Button
									variant="default"
									size="icon"
									className="size-8 rounded-full"
									onClick={handleStartChat}
									disabled={!prompt.trim() || !hasCredits}
								>
									<ArrowUpIcon />
								</Button>
							</PromptInputAction>
						</div>
					</PromptInputActions>
				</Input>
			</div>

			{/* Suggestions */}
			<div className="relative flex w-full flex-col items-center justify-center space-y-2">
				<div className="absolute top-0 left-0 h-[70px] w-full">
					{showCategorySuggestions ? (
						<div className="flex w-full flex-col space-y-1">
							{activeCategoryData?.items.map((suggestion) => (
								<Suggestion
									key={suggestion}
									highlight={activeCategoryData.highlight}
									onClick={() => {
										setPrompt(suggestion);
										setActiveCategory("");
									}}
								>
									{suggestion}
								</Suggestion>
							))}
						</div>
					) : (
						<div className="relative flex w-full flex-wrap items-stretch justify-start gap-2">
							{suggestionGroups.map((suggestion) => (
								<Suggestion
									key={suggestion.label}
									size="sm"
									onClick={() => {
										setActiveCategory(suggestion.label);
										setPrompt("");
									}}
									className="capitalize"
								>
									{suggestion.icon && <suggestion.icon />}
									{suggestion.label}
								</Suggestion>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
