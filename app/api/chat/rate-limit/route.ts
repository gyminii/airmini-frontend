import { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { GUEST_MESSAGE_LIMIT } from "@/lib/constants/chat";
import { auth } from "@clerk/nextjs/server";

const GUEST_WINDOW = "24 h";

export async function GET(req: NextRequest) {
	const { userId } = await auth();
	if (userId) {
		return new Response(JSON.stringify({ remaining: null }), {
			headers: { "Content-Type": "application/json" },
		});
	}

	const url = process.env.UPSTASH_REDIS_REST_URL;
	const token = process.env.UPSTASH_REDIS_REST_TOKEN;
	if (!url || !token) {
		return new Response(JSON.stringify({ remaining: GUEST_MESSAGE_LIMIT }), {
			headers: { "Content-Type": "application/json" },
		});
	}

	const redis = new Redis({ url, token });
	const ratelimit = new Ratelimit({
		redis,
		limiter: Ratelimit.fixedWindow(GUEST_MESSAGE_LIMIT, GUEST_WINDOW),
		prefix: "airmini:guest",
	});

	const ip =
		req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		req.headers.get("x-real-ip") ??
		"anonymous";

	// getRemaining doesn't consume a token — it only reads the current count
	const { remaining, reset } = await ratelimit.getRemaining(ip);

	return new Response(
		JSON.stringify({ remaining, reset: new Date(reset).toISOString() }),
		{ headers: { "Content-Type": "application/json" } },
	);
}
