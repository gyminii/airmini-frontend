"use client";

import { useThemeConfig } from "@/components/active-theme";
import {
	ColorModeSelector,
	ContentLayoutSelector,
	PresetSelector,
	ResetThemeButton,
	ThemeRadiusSelector,
	ThemeScaleSelector,
} from "@/components/theme-customizer/index";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandGroup,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { Settings } from "lucide-react";
import { SidebarToggle } from "./sidebar-toggle";

export function ThemeCustomizerPanel() {
	const { theme } = useThemeConfig();
	const isMobile = useIsMobile();

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button size="icon" variant="ghost">
					<Settings className="animate-tada" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-80 p-0 h-full"
				align={isMobile ? "center" : "end"}
			>
				<Command className="rounded-lg border-none shadow-none">
					{/* <CommandInput placeholder="Search settings..." /> */}
					<CommandList>
						{/* <CommandEmpty>No settings found.</CommandEmpty> */}
						<CommandGroup heading="Appearance">
							<div className="p-3 space-y-4">
								<PresetSelector />
								<ThemeScaleSelector />
								<ThemeRadiusSelector />
								<ColorModeSelector />
								<ContentLayoutSelector />
							</div>
						</CommandGroup>
						<CommandSeparator />
						<CommandGroup heading="Layout">
							<div className="p-3 space-y-4">
								<SidebarToggle />
								{/* {theme.isSidebar && <SidebarModeSelector />} */}
							</div>
						</CommandGroup>
						<CommandSeparator />
						<div className="p-3">
							<ResetThemeButton />
						</div>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
