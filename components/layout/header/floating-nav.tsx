"use client";

import { SignInModal } from "@/components/auth/sign-in-modal";
import { ReadMeModal } from "@/components/chat-interface/readme-modal";
import { ThemeCustomizerPanel } from "@/components/theme-customizer";
import { useUser } from "@clerk/nextjs";
import { HelpCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import ThemeSwitch from "../settings/theme-switch";
import UserMenu from "../settings/user-menu";

export function FloatNav() {
	const { isSignedIn, isLoaded } = useUser();
	const [showSignIn, setShowSignIn] = useState(false);

	return (
		<>
			<SignInModal open={showSignIn} onOpenChange={setShowSignIn} />
			<nav
				aria-label="Floating Navigation"
				className="-translate-x-1/2 fixed top-3.5 md:top-5.5 left-1/2 z-50 flex w-fit flex-row items-center justify-center whitespace-nowrap rounded-lg border bg-background/80 px-1 py-1 text-foreground shadow-xs backdrop-blur-sm transition"
			>
				<div className="flex items-center">
					<ThemeSwitch />
					<ThemeCustomizerPanel />
					{!isSignedIn && (
						<ReadMeModal>
							<button className="float-trigger flex items-center justify-center" aria-label="Read Me">
								<HelpCircle className="size-5" />
							</button>
						</ReadMeModal>
					)}
					{isLoaded && !isSignedIn && (
						<button
							onClick={() => setShowSignIn(true)}
							className="float-trigger flex items-center justify-center"
							aria-label="Sign in with Google"
						>
							<Image
								src="/images/google.svg"
								alt="Google"
								width={20}
								height={20}
							/>
						</button>
					)}
					{isSignedIn && <UserMenu />}
				</div>
			</nav>
		</>
	);
}
