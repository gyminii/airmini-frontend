"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

const WINDOW_HOURS = 2;
const MAX_REQUESTS = 30;
const WINDOW_MS = WINDOW_HOURS * 60 * 60 * 1000;

export type CreditLimits = {
	windowStartedAt: string;
	usedRequests: number;
};

type RateLimitErrorObject = {
	type: "RATE_LIMIT";
	resetAt: string;
};

function rateLimitError(resetAt: string): RateLimitErrorObject {
	return { type: "RATE_LIMIT", resetAt };
}

export async function managerCredits(): Promise<CreditLimits> {
	const { userId } = await auth();
	if (!userId) throw new Error("Unauthorized");

	const client = await clerkClient();
	const user = await client.users.getUser(userId);

	const publicMetadata = (user.publicMetadata ?? {}) as {
		credits?: CreditLimits;
	};
	const now = new Date();

	let credits: CreditLimits = publicMetadata.credits ?? {
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
		publicMetadata: { credits: updated },
	});

	return updated;
}

export type CreditStatus = {
	limits: CreditLimits;
	remaining: number;
	maxRequests: number;
	resetAt: string;
};

export async function getCreditStatus(): Promise<CreditStatus | null> {
	const { userId } = await auth();
	if (!userId) return null;

	const client = await clerkClient();
	const user = await client.users.getUser(userId);
	const publicMetadata = (user.publicMetadata ?? {}) as {
		credits?: CreditLimits;
	};

	const now = new Date();

	let credits: CreditLimits = publicMetadata.credits ?? {
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

	const resetAt = new Date(started.getTime() + WINDOW_MS).toISOString();
	const remaining = Math.max(0, MAX_REQUESTS - credits.usedRequests);

	return {
		limits: credits,
		remaining,
		maxRequests: MAX_REQUESTS,
		resetAt,
	};
}
