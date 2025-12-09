import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import { generateMeta } from "@/lib/utils";
import ChatSidebar from "@/components/chat-interface/sidebar";
import { getChats } from "@/lib/actions/chat";
import { auth } from "@clerk/nextjs/server";
import { SidebarSkeleton } from "@/components/chat-interface/sidebar-skeleton";

export async function generateMetadata(): Promise<Metadata> {
	return generateMeta({
		title: "Chat | Airmini",
		description: "AI-powered travel assistant chat",
		canonical: "/chat",
	});
}

async function AuthenticatedSidebar() {
	const { userId } = await auth();
	if (!userId) return null;

	const chats = await getChats();
	return <ChatSidebar chats={chats} />;
}

export default async function ChatLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<div className="relative flex h-full rounded-md lg:border">
			<Suspense fallback={<SidebarSkeleton />}>
				<AuthenticatedSidebar />
			</Suspense>
			<div className="flex w-full grow flex-col">{children}</div>
		</div>
	);
}
