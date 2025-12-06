import { Metadata } from "next";
import { generateMeta } from "@/lib/utils";
import AIChatSidebar from "@/components/chat-interface/ai-chat-sidebar";
import AIChatInterface from "@/components/chat-interface/ai-chat-interface";
import { getChats } from "@/lib/actions/chat";
import { auth } from "@clerk/nextjs/server";

export async function generateMetadata(): Promise<Metadata> {
	return generateMeta({
		title: "Chat | Airmini",
		description: "AI-powered travel assistant chat",
		canonical: "/chat",
	});
}

export default async function ChatPage() {
	const initialChats = await getChats();
	const { userId } = await auth();
	const isAuthenticated = !!userId;
	return (
		<div className="relative flex h-full rounded-md lg:border">
			{isAuthenticated && <AIChatSidebar initialChats={initialChats} />}
			<div className="flex w-full grow flex-col">
				<AIChatInterface />
			</div>
		</div>
	);
}
