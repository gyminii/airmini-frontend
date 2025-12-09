"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidateTag, cacheTag } from "next/cache";
import type { ChatSummary } from "@/types/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Cached fetch - token is part of cache key
async function fetchChats(token: string): Promise<ChatSummary[]> {
	"use cache";
	cacheTag("chats");

	const res = await fetch(`${API_URL}/chats`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!res.ok) return [];
	return res.json();
}

async function fetchChatMessages(token: string, chatId: string) {
	"use cache";
	cacheTag(`chat-${chatId}`);

	const res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!res.ok) return [];
	return res.json();
}

// Public functions - auth outside cache
export async function getChats(): Promise<ChatSummary[]> {
	const { getToken } = await auth();
	const token = await getToken();
	if (!token) return [];
	return fetchChats(token);
}

export async function getChatMessages(chatId: string) {
	const { getToken } = await auth();
	const token = await getToken();
	if (!token) return [];
	return fetchChatMessages(token, chatId);
}

export async function updateChat(chatId: string, title: string) {
	const { getToken } = await auth();
	const token = await getToken();
	if (!token) throw new Error("Unauthorized");

	const res = await fetch(`${API_URL}/chats/${chatId}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ title }),
	});

	if (!res.ok) throw new Error("Failed to update chat");

	revalidateTag("chats", "max");
	return res.json() as Promise<ChatSummary>;
}

export async function deleteChat(chatId: string) {
	const { getToken } = await auth();
	const token = await getToken();
	if (!token) throw new Error("Unauthorized");

	const res = await fetch(`${API_URL}/chats/${chatId}`, {
		method: "DELETE",
		headers: { Authorization: `Bearer ${token}` },
	});

	if (!res.ok) throw new Error("Failed to delete chat");

	revalidateTag("chats", "max");
	revalidateTag(`chat-${chatId}`, "max");
}

export async function invalidateChats() {
	revalidateTag("chats", "max");
}
