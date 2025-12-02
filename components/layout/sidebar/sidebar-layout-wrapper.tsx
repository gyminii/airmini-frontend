"use client";

import { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SiteHeader } from "@/components/layout/header";
import { useThemeConfig } from "@/components/active-theme";

export function SidebarLayoutWrapper({
	children,
	defaultOpen,
	initialSidebarEnabled,
}: {
	children: ReactNode;
	defaultOpen: boolean;
	initialSidebarEnabled: boolean;
}) {
	const { theme } = useThemeConfig();

	return (
		<div className="flex min-h-screen w-full">
			<AppSidebar />
			<div
				className="flex min-h-screen flex-1 flex-col transition-all duration-300"
				style={{
					marginLeft: theme.isSidebar ? "80px" : "0",
				}}
			>
				<SiteHeader />
				<div className="flex flex-1 flex-col">
					<div className="@container/main p-4 xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto">
						{children}
					</div>
				</div>
			</div>
		</div>
	);
}
