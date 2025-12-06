import { Redis } from "@upstash/redis";

export const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL!,
	token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ============ ANON SESSION FUNCTIONS ============
const ANON_SESSION_TTL = 60 * 60 * 24; // 24 hours

type Message = {
	role: "user" | "assistant";
	content: string;
};

export async function saveAnonMessage(sessionId: string, message: Message) {
	const key = `anon_chat:${sessionId}`;
	await redis.rpush(key, JSON.stringify(message));
	await redis.expire(key, ANON_SESSION_TTL);
}

export async function getAnonMessages(sessionId: string): Promise<Message[]> {
	const key = `anon_chat:${sessionId}`;
	const messages = await redis.lrange(key, 0, -1);
	return messages.map((msg) => JSON.parse(msg as string));
}

export async function deleteAnonMessages(sessionId: string) {
	const key = `anon_chat:${sessionId}`;
	await redis.del(key);
}

// ============ CHAT SEARCH INDEX FUNCTIONS ============

type ChatIndexData = {
	chatId: string;
	title: string;
	preview: string; // First ~100 chars of conversation
	updatedAt: string;
};

/**
 * Index a chat for search (call when chat is created/updated)
 */
export async function indexChat(userId: string, data: ChatIndexData) {
	const key = `chat_index:${userId}`;

	// Store as hash with chatId as field
	await redis.hset(key, {
		[data.chatId]: JSON.stringify(data),
	});
}

/**
 * Remove chat from index (call when chat is deleted)
 */
export async function removeFromIndex(userId: string, chatId: string) {
	const key = `chat_index:${userId}`;
	await redis.hdel(key, chatId);
}

/**
 * Search user's chats by keyword
 */
export async function searchChats(
	userId: string,
	query: string
): Promise<ChatIndexData[]> {
	const key = `chat_index:${userId}`;
	const allChats = await redis.hgetall(key);

	if (!allChats) return [];

	const queryLower = query.toLowerCase();
	const results: ChatIndexData[] = [];

	for (const [, value] of Object.entries(allChats)) {
		const chat = JSON.parse(value as string) as ChatIndexData;

		// Simple keyword matching
		if (
			chat.title?.toLowerCase().includes(queryLower) ||
			chat.preview?.toLowerCase().includes(queryLower)
		) {
			results.push(chat);
		}
	}

	// Sort by updatedAt descending
	return results.sort(
		(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
	);
}

/**
 * Get all indexed chats for a user (for rebuilding/debugging)
 */
export async function getAllIndexedChats(
	userId: string
): Promise<ChatIndexData[]> {
	const key = `chat_index:${userId}`;
	const allChats = await redis.hgetall(key);

	if (!allChats) return [];

	return Object.values(allChats)
		.map((v) => JSON.parse(v as string) as ChatIndexData)
		.sort(
			(a, b) =>
				new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
		);
}
