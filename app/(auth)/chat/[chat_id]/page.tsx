import Interface from "@/components/chat-interface/interface";
import { getChatMessages } from "@/lib/actions/chat";
import { convertToUIMessages } from "@/types/convertToUIMessages";

export default async function ChatPage({
	params,
}: {
	params: Promise<{ chat_id: string }>;
}) {
	const { chat_id } = await params;
	const backendMessages = await getChatMessages(chat_id);
	const messages = convertToUIMessages(backendMessages);

	return <Interface chatData={{ chat_id, messages }} />;
}
