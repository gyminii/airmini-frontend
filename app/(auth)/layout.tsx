import { cookies } from "next/headers";
import React from "react";

import { SiteHeader } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/layout/sidebar/sidebar";

export default async function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const cookieStore = await cookies();
	const defaultOpen =
		cookieStore.get("sidebar_state")?.value === "true" ||
		cookieStore.get("sidebar_state") === undefined;
	return (
		// <>
		// 	<div className="flex flex-1 flex-col">
		// 		<SiteHeader />

		// 		<div className="@container/main p-4 xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto">
		// 			{children}
		// 		</div>
		// 	</div>
		// </>
		<div className="h-screen overflow-hidden">
			<Sidebar />
			<main className="h-full overflow-y-auto md:ms-20">
				<div className="h-full p-4 xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto">
					{children}
				</div>
			</main>
		</div>
	);
}
