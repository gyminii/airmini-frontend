"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import {
	Compass,
	Library,
	History,
	Search,
	Menu,
	Plus,
	Sparkles,
	Ellipsis,
	Pencil,
	Trash2,
	Pin,
	Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AIUpgradePricingModal } from "./ai-upgrade-modal";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useChatList, useDeleteChat, useUpdateChat } from "@/hooks/use-chat";
import type { ChatSummary } from "@/types/chat";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

interface SidebarItem {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	isActive?: boolean;
}

const sidebarItems: SidebarItem[] = [
	{ icon: Compass, label: "Explore" },
	{ icon: Library, label: "Library" },
	{ icon: History, label: "History" },
];

const groupConversationsByCategory = (conversations: ChatSummary[]) => {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);
	const sevenDaysAgo = new Date(today);
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

	type Group = {
		title: string;
		conversations: ChatSummary[];
	};

	const groups: Record<string, Group> = {
		today: { title: "Today", conversations: [] },
		yesterday: { title: "Yesterday", conversations: [] },
		"7days": { title: "Previous 7 Days", conversations: [] },
		older: { title: "Older", conversations: [] },
	};

	conversations.forEach((conv) => {
		const createdDate = new Date(conv.created_at);
		if (createdDate >= today) {
			groups.today.conversations.push(conv);
		} else if (createdDate >= yesterday) {
			groups.yesterday.conversations.push(conv);
		} else if (createdDate >= sevenDaysAgo) {
			groups["7days"].conversations.push(conv);
		} else {
			groups.older.conversations.push(conv);
		}
	});

	return Object.entries(groups)
		.filter(([_, group]) => group.conversations.length > 0)
		.map(([key, group]) => ({ key, ...group }));
};

const SidebarContent = ({ initialChats }: { initialChats: ChatSummary[] }) => {
	const [searchQuery, setSearchQuery] = useState("");
	const params = useParams<{ chat_id?: string[] }>();
	const router = useRouter();
	const currentChatId = params.chat_id?.[0];
	const { isSignedIn } = useAuth();

	// Rename dialog state
	const [renameDialogOpen, setRenameDialogOpen] = useState(false);
	const [chatToRename, setChatToRename] = useState<ChatSummary | null>(null);
	const [newTitle, setNewTitle] = useState("");

	// Delete dialog state
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [chatToDelete, setChatToDelete] = useState<ChatSummary | null>(null);

	const { data: chats = initialChats } = useChatList(initialChats);
	const deleteChat = useDeleteChat();
	const updateChat = useUpdateChat();

	const filteredConversations = searchQuery
		? chats.filter((chat) =>
				chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
		  )
		: chats;

	const conversationGroups = groupConversationsByCategory(
		filteredConversations
	);

	const handleRenameClick = (chat: ChatSummary) => {
		setChatToRename(chat);
		setNewTitle(chat.title || "");
		setRenameDialogOpen(true);
	};

	const handleRenameSubmit = async () => {
		if (!chatToRename || !newTitle.trim()) return;

		try {
			await updateChat.mutateAsync({
				chatId: chatToRename.id,
				title: newTitle.trim(),
			});
			toast.success("Chat renamed successfully");
			setRenameDialogOpen(false);
			setChatToRename(null);
			setNewTitle("");
		} catch (error) {
			toast.error("Failed to rename chat");
		}
	};

	const handleDeleteClick = (chat: ChatSummary) => {
		setChatToDelete(chat);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!chatToDelete) return;

		try {
			await deleteChat.mutateAsync(chatToDelete.id);
			toast.success("Chat deleted successfully");

			// If we deleted the current chat, navigate to /chat
			if (currentChatId === chatToDelete.id) {
				router.push("/chat");
			}

			setDeleteDialogOpen(false);
			setChatToDelete(null);
		} catch (error) {
			toast.error("Failed to delete chat");
		}
	};

	return (
		<>
			<div className="flex h-full w-72 flex-col border-e">
				<div className="shrink-0 border-b px-4 py-2">
					<div className="relative">
						<Search className="text-muted-foreground absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
						<Input
							placeholder="Search chats..."
							className="bg-background border-transparent pl-6 text-sm shadow-none focus:border-transparent! focus:shadow-none focus:ring-0!"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>

				<div className="flex-1 space-y-4 overflow-y-auto p-4">
					{!isSignedIn && (
						<div className="text-muted-foreground py-4 text-center text-sm">
							Sign in to see your chat history
						</div>
					)}

					{isSignedIn && conversationGroups.length === 0 && !searchQuery && (
						<div className="text-muted-foreground py-4 text-center text-sm">
							No conversations yet
						</div>
					)}

					{conversationGroups.map((group) => (
						<div key={group.key}>
							<h3 className="text-muted-foreground mb-4 text-xs">
								{group.title}
							</h3>
							<div className="space-y-0.5">
								{group.conversations.map((conversation) => (
									<div
										className="group flex items-center"
										key={conversation.id}
									>
										<Link
											href={`/chat/${conversation.id}`}
											className={cn(
												"hover:bg-muted block w-full min-w-0 justify-start truncate rounded-lg p-2 px-3 text-start text-sm",
												currentChatId === conversation.id && "bg-muted"
											)}
										>
											{conversation.title || "New Chat"}
										</Link>

										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="shrink-0 opacity-0 group-hover:opacity-100"
												>
													<Ellipsis className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() => handleRenameClick(conversation)}
												>
													<Pencil className="mr-2 h-4 w-4" />
													Rename
												</DropdownMenuItem>
												<DropdownMenuItem>
													<Share2 className="mr-2 h-4 w-4" />
													Share
												</DropdownMenuItem>
												<DropdownMenuItem>
													<Pin className="mr-2 h-4 w-4" />
													Pin
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-destructive focus:text-destructive"
													onClick={() => handleDeleteClick(conversation)}
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								))}
							</div>
						</div>
					))}

					{filteredConversations.length === 0 && searchQuery && (
						<div className="text-muted-foreground py-4 text-center text-sm">
							No conversations found
						</div>
					)}
				</div>

				<div className="shrink-0">
					<div className="p-4">
						{sidebarItems.map((item) => (
							<Button
								key={item.label}
								variant="ghost"
								className={cn(
									"hover:bg-muted w-full justify-start",
									item.isActive && "bg-muted"
								)}
							>
								<item.icon className="mr-2 h-4 w-4" />
								{item.label}
							</Button>
						))}

						<AIUpgradePricingModal>
							<Button
								variant="ghost"
								className="hover:bg-muted w-full justify-start"
							>
								<Sparkles className="mr-2 h-4 w-4" />
								Upgrade
							</Button>
						</AIUpgradePricingModal>
					</div>

					<div className="border-t p-4">
						<Button className="w-full" asChild>
							<Link href="/chat">
								<Plus className="mr-2 h-4 w-4" />
								New Chat
							</Link>
						</Button>
					</div>
				</div>
			</div>

			{/* Rename Dialog */}
			<Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Rename Chat</DialogTitle>
						<DialogDescription>
							Enter a new name for this conversation.
						</DialogDescription>
					</DialogHeader>
					<Input
						value={newTitle}
						onChange={(e) => setNewTitle(e.target.value)}
						placeholder="Chat name"
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleRenameSubmit();
							}
						}}
					/>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setRenameDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleRenameSubmit}
							disabled={!newTitle.trim() || updateChat.isPending}
						>
							{updateChat.isPending ? "Saving..." : "Save"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Chat</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete &quot;
							{chatToDelete?.title || "this chat"}&quot;? This action cannot be
							undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteConfirm}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							disabled={deleteChat.isPending}
						>
							{deleteChat.isPending ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};

export default function AIChatSidebar({
	initialChats,
}: {
	initialChats: ChatSummary[];
}) {
	return (
		<>
			<div className="hidden md:flex">
				<SidebarContent initialChats={initialChats} />
			</div>

			<Sheet>
				<SheetTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="absolute end-0 top-0 z-10 md:hidden"
					>
						<Menu />
					</Button>
				</SheetTrigger>
				<SheetContent side="left">
					<SidebarContent initialChats={initialChats} />
				</SheetContent>
			</Sheet>
		</>
	);
}
