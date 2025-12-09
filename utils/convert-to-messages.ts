import type { AirminiUIMessage, Message } from "@/types/chat";

export function convertToUIMessages(messages: Message[]): AirminiUIMessage[] {
	return messages.map((msg) => ({
		id: msg.id,
		role: msg.role,
		parts: [{ type: "text", text: msg.content }],
	}));
}
