"use client";

import { OnboardingDialog } from "@/components/onboarding/onboarding-dialog";
import { VercelCard } from "@/components/ui/vercel-card";

export default function OnboardingPage() {
	return (
		<div className="flex h-screen w-full items-center justify-center p-4">
			<div className="flex flex-col items-center space-y-0 text-center">
				<VercelCard
					className="w-full max-w-sm flex items-center justify-center"
					// animateOnHover
					glowEffect
				>
					<div className="text-center px-6">
						<h1 className="text-2xl font-semibold text-black dark:text-white mb-3">
							Welcome to Airmini 👋
						</h1>
						<p className="text-gray-700 dark:text-gray-300">
							AI-powered travel assistant
						</p>

						<OnboardingDialog />
					</div>
				</VercelCard>
			</div>
		</div>
	);
}

// <Button variant="link">✨ Get Started</Button>
