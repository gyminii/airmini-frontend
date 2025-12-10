import Interface from "@/components/chat-interface/interface";
import { getCreditStatus } from "@/lib/actions/credit-manager";
import { auth } from "@clerk/nextjs/server";
import { connection } from "next/server";
export default async function ChatPage() {
	await connection();
	const { isAuthenticated } = await auth();
	let chat_id = "new";
	const credits = await getCreditStatus();
	if (isAuthenticated) {
		chat_id = crypto.randomUUID();
	}
	return (
		<Interface
			chatData={{ chat_id, messages: [] }}
			isNewChat
			credits={credits}
		/>
	);
}
