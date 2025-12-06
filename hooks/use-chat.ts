"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import type { Message, ChatSummary, ChatUpdate } from "@/types/chat";
import type { UIMessage } from "ai";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Convert backend messages to AI SDK UIMessage format
export function convertToUIMessages(messages: Message[]): UIMessage[] {
	return messages.map((msg) => ({
		id: msg.id,
		role: msg.role as "user" | "assistant",
		parts: [{ type: "text" as const, text: msg.content }],
		createdAt: new Date(msg.created_at),
	}));
}

export function useChatList(initialData?: ChatSummary[]) {
	const { getToken, isSignedIn, isLoaded } = useAuth();

	return useQuery({
		queryKey: ["chats"],
		queryFn: async () => {
			const token = await getToken();
			if (!token) return [];

			const response = await fetch(`${API_URL}/chats`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				return [];
			}

			return response.json() as Promise<ChatSummary[]>;
		},
		initialData,
		enabled: isLoaded && isSignedIn,
	});
}

export function useChatMessages(chatId?: string) {
	const { getToken, isSignedIn, isLoaded } = useAuth();

	return useQuery({
		queryKey: ["messages", chatId],
		queryFn: async () => {
			if (!chatId) return [];

			const token = await getToken();
			if (!token) return [];

			const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				return [];
			}

			return response.json() as Promise<Message[]>;
		},
		enabled: !!chatId && isLoaded && isSignedIn,
	});
}

export function useUpdateChat() {
	const { getToken } = useAuth();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			chatId,
			title,
		}: {
			chatId: string;
			title: string;
		}) => {
			const token = await getToken();

			const response = await fetch(`${API_URL}/chats/${chatId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					...(token && { Authorization: `Bearer ${token}` }),
				},
				body: JSON.stringify({ title } as ChatUpdate),
			});

			if (!response.ok) {
				throw new Error("Failed to update chat");
			}

			return response.json() as Promise<ChatSummary>;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["chats"] });
		},
	});
}

export function useDeleteChat() {
	const { getToken } = useAuth();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (chatId: string) => {
			const token = await getToken();
			const response = await fetch(`${API_URL}/chats/${chatId}`, {
				method: "DELETE",
				headers: {
					...(token && { Authorization: `Bearer ${token}` }),
				},
			});

			if (!response.ok) {
				throw new Error("Failed to delete chat");
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["chats"] });
		},
	});
}

export function useClaimConversation() {
	const { getToken } = useAuth();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (
			messages: Array<{ role: "user" | "assistant"; content: string }>
		) => {
			const token = await getToken();

			const response = await fetch(`${API_URL}/chats/claim-conversation`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ messages }),
			});

			if (!response.ok) {
				throw new Error("Failed to claim conversation");
			}

			return response.json() as Promise<ChatSummary>;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["chats"] });
		},
	});
}
