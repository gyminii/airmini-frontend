"use client";

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeSwitch() {
	const { theme, setTheme } = useTheme();

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					onClick={() => setTheme(theme === "light" ? "dark" : "light")}
					className="float-trigger flex items-center justify-center"
				>
					{theme === "light" ? (
						<SunIcon className="size-5" />
					) : (
						<MoonIcon className="size-5" />
					)}
					<span className="sr-only">Toggle theme</span>
				</button>
			</TooltipTrigger>
			<TooltipContent>
				<p>Theme</p>
			</TooltipContent>
		</Tooltip>
	);
}
