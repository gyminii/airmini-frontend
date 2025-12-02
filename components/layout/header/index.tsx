"use client";

import { useThemeConfig } from "@/components/active-theme";
import ThemeSwitch from "@/components/layout/header/theme-switch";
import UserMenu from "@/components/layout/header/user-menu";
import { ThemeCustomizerPanel } from "@/components/theme-customizer";
import { Separator } from "@/components/ui/separator";

export function SiteHeader() {
	return (
		<header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background">
			<div className="flex w-full items-center gap-2 px-4">
				<div className="ml-auto flex items-center gap-2">
					<ThemeSwitch />
					<ThemeCustomizerPanel />
					<Separator orientation="vertical" className="h-4" />
					<UserMenu />
				</div>
			</div>
		</header>
	);
}
