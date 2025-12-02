"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	DialogStack,
	DialogStackBody,
	DialogStackContent,
	DialogStackDescription,
	DialogStackFooter,
	DialogStackHeader,
	DialogStackNext,
	DialogStackOverlay,
	DialogStackPrevious,
	DialogStackTitle,
	DialogStackTrigger,
} from "@/components/ui/shadcn-io/dialog-stack";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import { Languages, Flag, MapPin, MapPinned } from "lucide-react";

export function OnboardingDialog() {
	const router = useRouter();

	// Form state
	const [formData, setFormData] = React.useState({
		language: "EN",
		nationality: "",
		originCountry: "",
		originCity: "",
		destinationCountry: "",
		destinationCity: "",
	});

	const handleComplete = () => {
		// TODO: Save to Clerk metadata
		console.log("Form data:", formData);
		toast.success("Welcome aboard! You're all set.");
		router.push("/");
	};

	return (
		<DialogStack>
			<DialogStackTrigger asChild>
				<Button variant="link">✨ Get Started</Button>
			</DialogStackTrigger>
			<DialogStackOverlay />
			<DialogStackBody>
				{/* Step 1: Language Preferences */}
				<DialogStackContent className="sm:max-w-[500px]">
					<DialogStackHeader>
						<div className="flex items-center gap-2">
							<Languages className="size-5 text-primary" />
							<DialogStackTitle>Language Preference</DialogStackTitle>
						</div>
						<DialogStackDescription>
							Choose your preferred language
						</DialogStackDescription>
					</DialogStackHeader>
					<div className="space-y-4 py-6">
						<div className="space-y-3">
							<Label>Language</Label>
							<ToggleGroup
								type="single"
								value={formData.language}
								onValueChange={(value) => {
									if (value) setFormData({ ...formData, language: value });
								}}
								className="justify-start"
							>
								<ToggleGroupItem value="EN" className="w-32">
									English
								</ToggleGroupItem>
								<ToggleGroupItem value="KO" className="w-32">
									한국어
								</ToggleGroupItem>
							</ToggleGroup>
						</div>
					</div>
					<DialogStackFooter className="justify-between">
						<DialogStackNext asChild>
							<Button variant="ghost">Skip</Button>
						</DialogStackNext>
						<DialogStackNext asChild>
							<Button>Next</Button>
						</DialogStackNext>
					</DialogStackFooter>
				</DialogStackContent>

				{/* Step 2: Nationality */}
				<DialogStackContent className="sm:max-w-[500px]">
					<DialogStackHeader>
						<div className="flex items-center gap-2">
							<Flag className="size-5 text-primary" />
							<DialogStackTitle>Where are you from?</DialogStackTitle>
						</div>
						<DialogStackDescription>
							This helps us provide accurate visa information
						</DialogStackDescription>
					</DialogStackHeader>
					<div className="space-y-4 py-6">
						<div className="space-y-2">
							<Label>Nationality</Label>
							<Select
								value={formData.nationality}
								onValueChange={(value) =>
									setFormData({ ...formData, nationality: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select your country" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="US">United States</SelectItem>
									<SelectItem value="KR">South Korea</SelectItem>
									<SelectItem value="JP">Japan</SelectItem>
									<SelectItem value="CN">China</SelectItem>
									<SelectItem value="GB">United Kingdom</SelectItem>
									<SelectItem value="CA">Canada</SelectItem>
									<SelectItem value="AU">Australia</SelectItem>
									<SelectItem value="FR">France</SelectItem>
									<SelectItem value="DE">Germany</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogStackFooter className="justify-between">
						<div className="flex gap-2">
							<DialogStackPrevious asChild>
								<Button variant="outline">Previous</Button>
							</DialogStackPrevious>
							<DialogStackNext asChild>
								<Button variant="ghost">Skip</Button>
							</DialogStackNext>
						</div>
						<DialogStackNext asChild>
							<Button>Next</Button>
						</DialogStackNext>
					</DialogStackFooter>
				</DialogStackContent>

				{/* Step 3: Trip Origin */}
				<DialogStackContent className="sm:max-w-[500px]">
					<DialogStackHeader>
						<div className="flex items-center gap-2">
							<MapPin className="size-5 text-primary" />
							<DialogStackTitle>Traveling from?</DialogStackTitle>
						</div>
						<DialogStackDescription>
							Where will you be departing from?
						</DialogStackDescription>
					</DialogStackHeader>
					<div className="space-y-4 py-6">
						<div className="space-y-2">
							<Label>Origin Country</Label>
							<Input
								placeholder="e.g., South Korea"
								value={formData.originCountry}
								onChange={(e) =>
									setFormData({
										...formData,
										originCountry: e.target.value,
									})
								}
							/>
						</div>
						<div className="space-y-2">
							<Label>City or Airport</Label>
							<Input
								placeholder="e.g., Seoul, ICN"
								value={formData.originCity}
								onChange={(e) =>
									setFormData({
										...formData,
										originCity: e.target.value,
									})
								}
							/>
						</div>
					</div>
					<DialogStackFooter className="justify-between">
						<div className="flex gap-2">
							<DialogStackPrevious asChild>
								<Button variant="outline">Previous</Button>
							</DialogStackPrevious>
							<DialogStackNext asChild>
								<Button variant="ghost">Skip</Button>
							</DialogStackNext>
						</div>
						<DialogStackNext asChild>
							<Button>Next</Button>
						</DialogStackNext>
					</DialogStackFooter>
				</DialogStackContent>

				{/* Step 4: Destination */}
				<DialogStackContent className="sm:max-w-[500px]">
					<DialogStackHeader>
						<div className="flex items-center gap-2">
							<MapPinned className="size-5 text-primary" />
							<DialogStackTitle>Where to?</DialogStackTitle>
						</div>
						<DialogStackDescription>
							What&apos;s your destination?
						</DialogStackDescription>
					</DialogStackHeader>
					<div className="space-y-4 py-6">
						<div className="space-y-2">
							<Label>Destination Country</Label>
							<Input
								placeholder="e.g., Japan"
								value={formData.destinationCountry}
								onChange={(e) =>
									setFormData({
										...formData,
										destinationCountry: e.target.value,
									})
								}
							/>
						</div>
						<div className="space-y-2">
							<Label>City or Airport</Label>
							<Input
								placeholder="e.g., Tokyo, NRT"
								value={formData.destinationCity}
								onChange={(e) =>
									setFormData({
										...formData,
										destinationCity: e.target.value,
									})
								}
							/>
						</div>
					</div>
					<DialogStackFooter className="justify-between">
						<DialogStackPrevious asChild>
							<Button variant="outline">Previous</Button>
						</DialogStackPrevious>
						<Button onClick={handleComplete}>Complete</Button>
					</DialogStackFooter>
				</DialogStackContent>
			</DialogStackBody>
		</DialogStack>
	);
}
