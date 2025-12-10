// lib/actions/trip-context.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { cacheTag, revalidateTag } from "next/cache";
import type { TripContext } from "@/types/chat";

async function fetchTripContext(
	chatId: string,
	token: string
): Promise<TripContext | null> {
	"use cache";
	cacheTag(`trip-context-${chatId}`);

	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/trip-context/${chatId}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		}
	);

	if (!res.ok) {
		console.error("Failed to fetch trip context:", res.status);
		return null;
	}

	const data = await res.json();
	return data.trip_context;
}

export async function getTripContext(
	chatId: string
): Promise<TripContext | null> {
	const { userId, getToken } = await auth();
	if (!userId) return null;

	const token = await getToken();
	if (!token) return null;

	return fetchTripContext(chatId, token);
}

export async function invalidateTripContext(chatId: string) {
	revalidateTag(`trip-context-${chatId}`, "max");
}
