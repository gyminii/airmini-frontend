"use client";

import { useThemeConfig } from "@/components/active-theme";
import ThemeSwitch from "@/components/layout/header/theme-switch";
import UserMenu from "@/components/layout/header/user-menu";
import { ThemeCustomizerPanel } from "@/components/theme-customizer";
import { Dock, DockIcon } from "@/components/ui/dock";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Home, MessageSquare, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
	const pathname = usePathname();

	return (
		<>
			{/* Desktop Sidebar */}
			<div className="hidden lg:block fixed left-4 top-1/2 z-50 -translate-y-1/2">
				<TooltipProvider>
					<Dock
						orientation="vertical"
						direction="middle"
						className="bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
					>
						<Tooltip>
							<TooltipTrigger asChild>
								<DockIcon>
									<ThemeSwitch />
								</DockIcon>
							</TooltipTrigger>
							<TooltipContent side="right">
								<p>Theme</p>
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<DockIcon>
									<ThemeCustomizerPanel />
								</DockIcon>
							</TooltipTrigger>
							<TooltipContent side="right">
								<p>Customize</p>
							</TooltipContent>
						</Tooltip>

						<div className="my-2 h-px w-full bg-border" />

						<Tooltip>
							<TooltipTrigger asChild>
								<DockIcon>
									<UserMenu />
								</DockIcon>
							</TooltipTrigger>
							<TooltipContent side="right">
								<p>Account</p>
							</TooltipContent>
						</Tooltip>
					</Dock>
				</TooltipProvider>
			</div>

			{/* Mobile Bottom Dock */}
			<div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
				<TooltipProvider>
					<Dock
						orientation="horizontal"
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
							<TooltipContent side="top">
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
							<TooltipContent side="top">
								<p>Chat</p>
							</TooltipContent>
						</Tooltip>

						<div className="mx-2 w-px h-full bg-border" />

						<Tooltip>
							<TooltipTrigger asChild>
								<DockIcon>
									<ThemeSwitch />
								</DockIcon>
							</TooltipTrigger>
							<TooltipContent side="top">
								<p>Theme</p>
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<DockIcon>
									<ThemeCustomizerPanel />
								</DockIcon>
							</TooltipTrigger>
							<TooltipContent side="top">
								<p>Customize</p>
							</TooltipContent>
						</Tooltip>

						<div className="mx-2 w-px h-full bg-border" />
						<Tooltip>
							<TooltipTrigger asChild>
								<DockIcon>
									<UserMenu />
								</DockIcon>
							</TooltipTrigger>
							<TooltipContent side="top">
								<p>Account</p>
							</TooltipContent>
						</Tooltip>
					</Dock>
				</TooltipProvider>
			</div>
		</>
	);
}
