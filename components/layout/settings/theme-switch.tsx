"use client";

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitch() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					onClick={() => setTheme(theme === "light" ? "dark" : "light")}
					className="float-trigger flex items-center justify-center"
				>
					{mounted ? (
						theme === "light" ? (
							<SunIcon className="size-5" />
						) : (
							<MoonIcon className="size-5" />
						)
					) : (
						<span className="size-5" />
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
