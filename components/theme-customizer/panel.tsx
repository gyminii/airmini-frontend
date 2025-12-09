import {
	ColorModeSelector,
	ContentLayoutSelector,
	PresetSelector,
	ResetThemeButton,
	ThemeRadiusSelector,
	ThemeScaleSelector,
} from "@/components/theme-customizer/index";
import {
	Command,
	CommandGroup,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Settings } from "lucide-react";

export function ThemeCustomizerPanel() {
	return (
		<Dialog>
			<Tooltip>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<button className="float-trigger flex items-center justify-center">
							<Settings className="size-5" />
							<span className="sr-only">Customize theme</span>
						</button>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>
					<p>Customize</p>
				</TooltipContent>
			</Tooltip>
			<DialogTitle className="sr-only">Custimization panel</DialogTitle>
			<DialogContent className="max-w-2xl max-h-[80vh] p-0">
				<Command className="rounded-lg border-none shadow-none">
					<CommandList className="max-h-[70vh]">
						<CommandGroup heading="Appearance">
							<div className="p-4 space-y-4">
								<PresetSelector />
								<ThemeScaleSelector />
								<ThemeRadiusSelector />
								<ColorModeSelector />
								<ContentLayoutSelector />
							</div>
						</CommandGroup>

						<CommandSeparator />
						<div className="p-4">
							<ResetThemeButton />
						</div>
					</CommandList>
				</Command>
			</DialogContent>
		</Dialog>
	);
}
