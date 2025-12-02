"use client";

import { Label } from "@/components/ui/label";
import { useThemeConfig } from "@/components/active-theme";
import { Switch } from "@/components/ui/switch";

export function SidebarToggle() {
	const { theme, setTheme } = useThemeConfig();

	return (
		<div className="flex items-center justify-between gap-4">
			<Label htmlFor="sidebar-toggle">Show Sidebar</Label>
			<Switch
				id="sidebar-toggle"
				checked={theme.isSidebar}
				onCheckedChange={(checked) =>
					setTheme({ ...theme, isSidebar: checked })
				}
			/>
		</div>
	);
}
