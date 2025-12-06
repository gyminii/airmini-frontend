"use client";

import ThemeSwitch from "./layout/header/theme-switch";
import UserMenu from "./layout/header/user-menu";
import { ThemeCustomizerPanel } from "./theme-customizer";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { SignInModal } from "./auth/sign-in-modal";

export function FloatNav() {
	const { isSignedIn, isLoaded } = useUser();
	const [showSignIn, setShowSignIn] = useState(false);

	return (
		<>
			<SignInModal open={showSignIn} onOpenChange={setShowSignIn} />
			<nav
				aria-label="Floating Navigation"
				className=" -translate-x-1/2 fixed top-3.5 md:top-5.5 left-1/2 z-50 flex w-fit flex-row items-center justify-center whitespace-nowrap rounded-lg border bg-background/70 px-1 py-1 text-foreground bg-blend-luminosity shadow-xs backdrop-blur-xl transition"
			>
				<div className="flex items-center">
					<ThemeSwitch />
					<ThemeCustomizerPanel />
					{isLoaded && !isSignedIn && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowSignIn(true)}
							className="gap-2"
						>
							<LogIn className="size-4" />
							<span className="hidden sm:inline">Sign In</span>
						</Button>
					)}
					{isSignedIn && <UserMenu />}
				</div>
			</nav>
		</>
	);
}
