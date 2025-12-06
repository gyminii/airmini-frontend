import { auth } from "@clerk/nextjs/server";
import type { ChatSummary, Message } from "@/types/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getChats(): Promise<ChatSummary[]> {
	const { getToken } = await auth();
	const token = await getToken();

	if (!token) {
		return [];
	}

	const response = await fetch(`${API_URL}/chats`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		cache: "no-store",
	});

	console.log(response);
	if (!response.ok) {
		return [];
	}

	return response.json();
}

export async function getChat(chatId: string): Promise<ChatSummary | null> {
	const { getToken } = await auth();
	const token = await getToken();

	if (!token) {
		return null;
	}

	const response = await fetch(`${API_URL}/chats/${chatId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		cache: "no-store",
	});

	if (!response.ok) {
		return null;
	}

	return response.json();
}

export async function getChatMessages(chatId: string): Promise<Message[]> {
	const { getToken } = await auth();
	const token = await getToken();

	if (!token) {
		return [];
	}

	const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		cache: "no-store",
	});

	if (!response.ok) {
		return [];
	}

	return response.json();
}
