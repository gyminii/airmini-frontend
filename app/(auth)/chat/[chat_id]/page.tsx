import Interface from "@/components/chat-interface/interface";
import { getChatMessages } from "@/lib/actions/chat";
import { getCreditStatus } from "@/lib/actions/credit-manager";
import { getTripContext } from "@/lib/actions/trip-context";
import { convertToUIMessages } from "@/utils/convert-to-messages";

export default async function ChatPage({
	params,
}: {
	params: Promise<{ chat_id: string }>;
}) {
	const { chat_id } = await params;
	const [credits, backendMessages, tripContext] = await Promise.all([
		getCreditStatus(),
		getChatMessages(chat_id),
		getTripContext(chat_id),
	]);

	const formatted_messages = convertToUIMessages(backendMessages);
	return (
		<Interface
			chatData={{ chat_id, messages: formatted_messages }}
			credits={credits}
			tripContext={tripContext}
		/>
	);
}
