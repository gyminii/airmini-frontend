import Interface from "@/components/chat-interface/interface";
import { getChatMessages } from "@/lib/actions/chat";
import { convertToUIMessages } from "@/utils/convert-to-messages";

export default async function ChatPage({
	params,
}: {
	params: Promise<{ chat_id: string }>;
}) {
	const { chat_id } = await params;
	const backendMessages = await getChatMessages(chat_id);
	const formatted_messages = convertToUIMessages(backendMessages);
	return <Interface chatData={{ chat_id, messages: formatted_messages }} />;
}
