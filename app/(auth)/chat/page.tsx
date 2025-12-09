import Interface from "@/components/chat-interface/interface";
export default function ChatPage() {
	const chat_id = crypto.randomUUID();

	return <Interface chatData={{ chat_id, messages: [] }} isNewChat />;
}
