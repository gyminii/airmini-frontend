// app/settings/preferences/page.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { OnboardingDialog } from "@/components/onboarding/onboarding-dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function PreferencesPage() {
	const { user } = useUser();
	const [showOnboarding, setShowOnboarding] = useState(false);

	return (
		<div className="container max-w-4xl py-8">
			<h1 className="text-3xl font-bold mb-6">Travel Preferences</h1>

			<div className="space-y-6">
				<div className="bg-muted p-6 rounded-lg space-y-3">
					<div>
						<span className="font-semibold">Language:</span>{" "}
						{user?.publicMetadata?.language || "Not set"}
					</div>
					<div>
						<span className="font-semibold">Nationality:</span>{" "}
						{user?.publicMetadata?.nationality || "Not set"}
					</div>
					<div>
						<span className="font-semibold">Origin:</span>{" "}
						{user?.publicMetadata?.originCity || "Not set"}
					</div>
					<div>
						<span className="font-semibold">Destination:</span>{" "}
						{user?.publicMetadata?.destinationCity || "Not set"}
					</div>
				</div>

				<Button onClick={() => setShowOnboarding(true)}>
					Update Travel Preferences
				</Button>
			</div>

			<OnboardingDialog
				open={showOnboarding}
				onOpenChange={setShowOnboarding}
			/>
		</div>
	);
}
