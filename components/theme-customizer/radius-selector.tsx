"use client";

import { Label } from "@/components/ui/label";
import { useThemeConfig } from "@/components/providers/active-theme-provider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BanIcon } from "lucide-react";

export function ThemeRadiusSelector() {
	const { theme, setTheme } = useThemeConfig();

	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor="radius">Radius:</Label>
			<ToggleGroup
				value={theme.radius}
				type="single"
				className="*:border-input w-full gap-3 *:rounded-md *:border"
				onValueChange={(value) => {
					if (value) setTheme({ ...theme, radius: value });
				}}
			>
				<ToggleGroupItem
					value="none"
					variant="outline"
					className="text-xs data-[variant=outline]:border-l"
				>
					<BanIcon className="size-4" />
				</ToggleGroupItem>
				<ToggleGroupItem
					value="sm"
					variant="outline"
					className="text-xs data-[variant=outline]:border-l"
				>
					SM
				</ToggleGroupItem>
				<ToggleGroupItem
					value="default"
					variant="outline"
					className="text-xs data-[variant=outline]:border-l"
				>
					MD
				</ToggleGroupItem>
				<ToggleGroupItem
					value="lg"
					variant="outline"
					className="text-xs data-[variant=outline]:border-l"
				>
					LG
				</ToggleGroupItem>
				<ToggleGroupItem
					value="xl"
					variant="outline"
					className="text-xs data-[variant=outline]:border-l"
				>
					XL
				</ToggleGroupItem>
			</ToggleGroup>
		</div>
	);
}
