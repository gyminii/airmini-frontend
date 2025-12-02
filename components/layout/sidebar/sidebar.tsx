"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Settings } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dock, DockIcon } from "@/components/ui/dock";
import { useThemeConfig } from "@/components/active-theme";
import ThemeSwitch from "@/components/layout/header/theme-switch";
import { ThemeCustomizerPanel } from "@/components/theme-customizer";
import UserMenu from "@/components/layout/header/user-menu";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Sidebar() {
	const pathname = usePathname();
	const { theme } = useThemeConfig();
	const isMobile = useIsMobile();

	return (
		<div
			className={
				isMobile
					? "fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
					: "fixed left-4 top-1/2 -translate-y-1/2 z-50"
			}
		>
			<TooltipProvider>
				<Dock
					orientation={isMobile ? "horizontal" : "vertical"}
					direction="middle"
					className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
				>
					<Tooltip>
						<TooltipTrigger asChild>
							<Link href="/">
								<DockIcon className={pathname === "/" ? "bg-primary/10" : ""}>
									<Home
										className={`size-5 ${
											pathname === "/"
												? "text-primary"
												: "text-muted-foreground"
										}`}
									/>
								</DockIcon>
							</Link>
						</TooltipTrigger>
						<TooltipContent side={isMobile ? "top" : "right"}>
							<p>Home</p>
						</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Link href="/chat">
								<DockIcon
									className={pathname === "/chat" ? "bg-primary/10" : ""}
								>
									<MessageSquare
										className={`size-5 ${
											pathname === "/chat"
												? "text-primary"
												: "text-muted-foreground"
										}`}
									/>
								</DockIcon>
							</Link>
						</TooltipTrigger>
						<TooltipContent side={isMobile ? "top" : "right"}>
							<p>Chat</p>
						</TooltipContent>
					</Tooltip>

					<div
						className={
							isMobile
								? "mx-2 w-px h-full bg-border"
								: "my-2 h-px w-full bg-border"
						}
					/>

					<DockIcon>
						<ThemeSwitch />
					</DockIcon>

					<DockIcon>
						<ThemeCustomizerPanel />
					</DockIcon>

					<div
						className={
							isMobile
								? "mx-2 w-px h-full bg-border"
								: "my-2 h-px w-full bg-border"
						}
					/>

					<Tooltip>
						<TooltipTrigger asChild>
							<Link href="/settings">
								<DockIcon
									className={pathname === "/settings" ? "bg-primary/10" : ""}
								>
									<Settings
										className={`size-5 ${
											pathname === "/settings"
												? "text-primary"
												: "text-muted-foreground"
										}`}
									/>
								</DockIcon>
							</Link>
						</TooltipTrigger>
						<TooltipContent side={isMobile ? "top" : "right"}>
							<p>Settings</p>
						</TooltipContent>
					</Tooltip>

					<DockIcon>
						<UserMenu />
					</DockIcon>
				</Dock>
			</TooltipProvider>
		</div>
	);
}
