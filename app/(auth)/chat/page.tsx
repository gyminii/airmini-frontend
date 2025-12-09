import Interface from "@/components/chat-interface/interface";
import { getCreditStatus } from "@/lib/actions/credit-manager";
import { connection } from "next/server";
export default async function ChatPage() {
	await connection();

	const chat_id = crypto.randomUUID();
	const credits = await getCreditStatus();

	return (
		<Interface
			chatData={{ chat_id, messages: [] }}
			isNewChat
			credits={credits}
		/>
	);
}
