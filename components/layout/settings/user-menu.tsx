"use client";

import { LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Command,
	CommandGroup,
	CommandItem,
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
import { useClerk, useUser } from "@clerk/nextjs";

export default function UserMenu() {
	const { user } = useUser();
	const { signOut } = useClerk();

	if (!user) return null;

	const userName = user.fullName || user.firstName || "User";
	const userEmail = user.primaryEmailAddress?.emailAddress || "No email";
	const userImage = user.imageUrl;
	const userInitials = user.firstName?.[0] || user.lastName?.[0] || "U";

	const handleSignOut = () => {
		signOut({ redirectUrl: "/chat" });
	};

	return (
		<Dialog>
			<Tooltip>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<button className="float-trigger flex items-center justify-center">
							<Avatar className="size-8">
								<AvatarImage src={userImage} alt={userName} />
								<AvatarFallback>{userInitials}</AvatarFallback>
							</Avatar>
							<span className="sr-only">User menu</span>
						</button>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>
					<p>User</p>
				</TooltipContent>
			</Tooltip>
			<DialogTitle className="sr-only">User</DialogTitle>
			<DialogContent className="max-w-md  p-0">
				<Command className="h-full flex-1 rounded-lg border-none shadow-none">
					<CommandList className="h-full">
						<div className="p-4">
							<div className="flex items-center gap-3">
								<Avatar className="h-12 w-12">
									<AvatarImage src={userImage} alt={userName} />
									<AvatarFallback>{userInitials}</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{userName}</span>
									<span className="text-muted-foreground truncate text-xs">
										{userEmail}
									</span>
								</div>
							</div>
						</div>
						<CommandSeparator />
						<CommandGroup>
							<CommandItem onSelect={handleSignOut}>
								<LogOut className="mr-2 size-4" />
								Log out
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			</DialogContent>
		</Dialog>
	);
}
