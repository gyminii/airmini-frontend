"use client";

import { cn } from "@/lib/utils";
import {
	Ellipsis,
	Menu,
	Pencil,
	Pin,
	Plus,
	Share2,
	Sparkles,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useOptimistic, useTransition } from "react";

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
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { updateChat, deleteChat } from "@/lib/actions/chat";
import type { ChatSummary } from "@/types/chat";
import { toast } from "sonner";
import { ReadMeModal } from "./readme-modal";

type OptimisticAction =
	| { type: "delete"; chatId: string }
	| { type: "rename"; chatId: string; title: string };

function groupConversationsByCategory(conversations: ChatSummary[]) {
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
}

function SidebarContent({ chats }: { chats: ChatSummary[] }) {
	const params = useParams<{ chat_id?: string }>();
	const router = useRouter();
	const currentChatId = params.chat_id;
	const [isPending, startTransition] = useTransition();

	// Optimistic state for immediate UI feedback
	const [optimisticChats, updateOptimisticChats] = useOptimistic(
		chats,
		(state, action: OptimisticAction) => {
			switch (action.type) {
				case "delete":
					return state.filter((c) => c.id !== action.chatId);
				case "rename":
					return state.map((c) =>
						c.id === action.chatId ? { ...c, title: action.title } : c
					);
				default:
					return state;
			}
		}
	);

	// Dialog state
	const [renameDialogOpen, setRenameDialogOpen] = useState(false);
	const [chatToRename, setChatToRename] = useState<ChatSummary | null>(null);
	const [newTitle, setNewTitle] = useState("");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [chatToDelete, setChatToDelete] = useState<ChatSummary | null>(null);

	const conversationGroups = groupConversationsByCategory(optimisticChats);

	const handleRenameClick = (chat: ChatSummary) => {
		setChatToRename(chat);
		setNewTitle(chat.title || "");
		setRenameDialogOpen(true);
	};

	const handleRenameSubmit = () => {
		if (!chatToRename || !newTitle.trim()) return;

		const chatId = chatToRename.id;
		const title = newTitle.trim();

		startTransition(async () => {
			updateOptimisticChats({ type: "rename", chatId, title });

			try {
				await updateChat(chatId, title);
				router.refresh();
				toast.success("Chat renamed successfully");
			} catch {
				toast.error("Failed to rename chat");
			}
		});

		setRenameDialogOpen(false);
		setChatToRename(null);
		setNewTitle("");
	};

	const handleDeleteClick = (chat: ChatSummary) => {
		setChatToDelete(chat);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (!chatToDelete) return;

		const chatId = chatToDelete.id;
		const shouldRedirect = currentChatId === chatId;
		startTransition(async () => {
			updateOptimisticChats({ type: "delete", chatId });

			try {
				await deleteChat(chatId);
				router.refresh();

				toast.success("Chat deleted successfully");
				if (shouldRedirect) {
					router.push("/chat");
				}
			} catch {
				toast.error("Failed to delete chat");
			}
		});

		setDeleteDialogOpen(false);
		setChatToDelete(null);
	};

	return (
		<>
			<div className="flex h-full w-72 flex-col border-e">
				<div className="flex-1 space-y-4 overflow-y-auto p-4">
					{conversationGroups.length === 0 && (
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

												{/* <DropdownMenuItem>
													<Pin className="mr-2 h-4 w-4" />
													Pin
												</DropdownMenuItem> */}
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
				</div>

				<div className="shrink-0">
					<div className="p-4">
						<ReadMeModal>
							<Button
								variant="ghost"
								className="hover:bg-muted w-full justify-start"
							>
								<Sparkles className="mr-2 h-4 w-4" />
								Read Me
							</Button>
						</ReadMeModal>
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
							disabled={!newTitle.trim() || isPending}
						>
							{isPending ? "Saving..." : "Save"}
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
							disabled={isPending}
						>
							{isPending ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

export default function ChatSidebar({ chats }: { chats: ChatSummary[] }) {
	return (
		<>
			<div className="hidden md:flex">
				<SidebarContent chats={chats} />
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
					<SidebarContent chats={chats} />
				</SheetContent>
			</Sheet>
		</>
	);
}
