import type { Message } from "@/types/chat";
import type { AirminiUIMessage } from "@/types/chat-message";

export function convertToUIMessages(messages: Message[]): AirminiUIMessage[] {
	return messages.map((msg) => ({
		id: msg.id,
		role: msg.role,
		parts: [
			{
				type: "text",
				text: msg.content,
			},
		],
	}));
}
