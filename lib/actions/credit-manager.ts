"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { cacheTag, revalidateTag } from "next/cache";

const WINDOW_HOURS = 2;
const MAX_REQUESTS = 30;
const WINDOW_MS = WINDOW_HOURS * 60 * 60 * 1000;

export type CreditLimits = {
	windowStartedAt: string;
	usedRequests: number;
};

interface PrivateMetadata {
	credits?: CreditLimits;
	[key: string]: unknown;
}

type RateLimitErrorObject = {
	type: "RATE_LIMIT";
	resetAt: string;
};

function rateLimitError(resetAt: string): RateLimitErrorObject {
	return { type: "RATE_LIMIT", resetAt };
}

// 1 message = 1 credit, we do 2 hours / 30 request max
export async function managerCredits(): Promise<CreditLimits> {
	const { userId } = await auth();
	if (!userId) throw new Error("Unauthorized");

	const client = await clerkClient();
	const user = await client.users.getUser(userId);

	const privateMetadata = (user.privateMetadata ?? {}) as PrivateMetadata;

	const now = new Date();

	let credits: CreditLimits = privateMetadata.credits ?? {
		windowStartedAt: now.toISOString(),
		usedRequests: 0,
	};

	const started = new Date(credits.windowStartedAt);
	const elapsed = now.getTime() - started.getTime();

	if (elapsed >= WINDOW_MS) {
		credits = {
			windowStartedAt: now.toISOString(),
			usedRequests: 0,
		};
	}

	if (credits.usedRequests >= MAX_REQUESTS) {
		const resetAt = new Date(started.getTime() + WINDOW_MS).toISOString();
		throw rateLimitError(resetAt);
	}

	const updated: CreditLimits = {
		...credits,
		usedRequests: credits.usedRequests + 1,
	};

	await client.users.updateUserMetadata(userId, {
		privateMetadata: {
			credits: updated,
		},
	});

	revalidateTag("credits", "max");

	return updated;
}

export type CreditStatus = {
	limits: CreditLimits;
	remaining: number;
	maxRequests: number;
	resetAt: string;
};

// cached
async function computeCreditStatus(
	_userId: string,
	privateMetadata: PrivateMetadata
): Promise<CreditStatus> {
	"use cache";
	cacheTag("credits");

	const now = new Date();

	let credits: CreditLimits = privateMetadata.credits ?? {
		windowStartedAt: now.toISOString(),
		usedRequests: 0,
	};

	let started = new Date(credits.windowStartedAt);
	const elapsed = now.getTime() - started.getTime();

	if (elapsed >= WINDOW_MS) {
		credits = {
			windowStartedAt: now.toISOString(),
			usedRequests: 0,
		};
		started = new Date(credits.windowStartedAt);
	}

	const remaining = Math.max(0, MAX_REQUESTS - credits.usedRequests);
	const resetAt = new Date(started.getTime() + WINDOW_MS).toISOString();

	return {
		limits: credits,
		remaining,
		maxRequests: MAX_REQUESTS,
		resetAt,
	};
}

export async function getCreditStatus(): Promise<CreditStatus | null> {
	const { userId } = await auth();
	if (!userId) return null;

	const client = await clerkClient();
	const user = await client.users.getUser(userId);
	const privateMetadata = (user.privateMetadata ?? {}) as PrivateMetadata;

	return computeCreditStatus(userId, privateMetadata);
}
