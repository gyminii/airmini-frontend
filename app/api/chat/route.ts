import { NextRequest } from "next/server";
import type { UIMessage } from "ai";
import { auth } from "@clerk/nextjs/server";
import { managerCredits } from "@/lib/actions/credit-manager";
import { TripContext } from "@/types/chat";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { GUEST_MESSAGE_LIMIT } from "@/lib/constants/chat";

const GUEST_WINDOW = "24 h";

function getGuestRatelimit() {
	const url = process.env.UPSTASH_REDIS_REST_URL;
	const token = process.env.UPSTASH_REDIS_REST_TOKEN;
	if (!url || !token) return null;
	const redis = new Redis({ url, token });
	return new Ratelimit({
		redis,
		limiter: Ratelimit.fixedWindow(GUEST_MESSAGE_LIMIT, GUEST_WINDOW),
		prefix: "airmini:guest",
	});
}

export const maxDuration = 60;

type AIRequestPayload = {
	id: string;
	messages: UIMessage[];
	tripContext?: TripContext | null;
};

type RateLimitErrorObject = {
	type: "RATE_LIMIT";
	resetAt: string;
};

function isRateLimitError(err: unknown): err is RateLimitErrorObject {
	return (
		typeof err === "object" &&
		err !== null &&
		"type" in err &&
		(err as { type: unknown }).type === "RATE_LIMIT" &&
		"resetAt" in err
	);
}

/**
 * The backend sends {"type":"error","error":"..."} but the AI SDK expects
 * {"type":"error","errorText":"..."}. This transformer rewrites those events
 * in-flight so the SDK's Zod schema doesn't blow up.
 */
function normalizeErrorEvents(
	stream: ReadableStream<Uint8Array>,
): ReadableStream<Uint8Array> {
	const decoder = new TextDecoder();
	const encoder = new TextEncoder();
	let buffer = "";

	return stream.pipeThrough(
		new TransformStream<Uint8Array, Uint8Array>({
			transform(chunk, controller) {
				buffer += decoder.decode(chunk, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() ?? "";

				const out = lines
					.map((line) => {
						if (!line.startsWith("data: ")) return line;
						try {
							const parsed = JSON.parse(line.slice(6));
							if (
								parsed.type === "error" &&
								typeof parsed.error === "string" &&
								parsed.errorText === undefined
							) {
								parsed.errorText = parsed.error;
								delete parsed.error;
								return `data: ${JSON.stringify(parsed)}`;
							}
						} catch {
							// not valid JSON — pass through unchanged
						}
						return line;
					})
					.join("\n");

				controller.enqueue(encoder.encode(out + "\n"));
			},
			flush(controller) {
				if (buffer) controller.enqueue(encoder.encode(buffer));
			},
		}),
	);
}

export async function POST(req: NextRequest) {
	try {
		const { userId, getToken } = await auth();
		const token = await getToken();

		const aiPayload = (await req.json()) as AIRequestPayload;
		const messages = aiPayload.messages;
		const last = messages[messages.length - 1];

		const text =
			last?.parts
				?.map((part) => (part.type === "text" ? part.text : ""))
				.join("") ?? "";

		const isValidUUID =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
				aiPayload.id,
			);

		let chatId: string | null = null;

		// guest: IP-based rate limit via Upstash
		let guestRemaining: number | null = null;
		if (!userId) {
			const ratelimit = getGuestRatelimit();
			if (ratelimit) {
				const ip =
					req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
					req.headers.get("x-real-ip") ??
					"anonymous";
				const { success, remaining, reset } = await ratelimit.limit(ip);
				if (!success) {
					return new Response(
						JSON.stringify({
							error: "rate_limit",
							message: `Guest limit of ${GUEST_MESSAGE_LIMIT} messages per day reached. Sign in for unlimited access.`,
							resetAt: new Date(reset).toISOString(),
							remaining: 0,
						}),
						{
							status: 429,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
				guestRemaining = remaining;
			}
		}

		// authenticated: require valid chatId + apply credit limits
		if (userId) {
			if (!isValidUUID) {
				return new Response("Invalid chatId", { status: 400 });
			}

			chatId = aiPayload.id;

			try {
				// This consumes one credit and revalidates "credits" tag
				await managerCredits();
			} catch (err: unknown) {
				if (isRateLimitError(err)) {
					return new Response(
						JSON.stringify({
							error: "rate_limit",
							message:
								"You reached the 30 message limit. Resets every 2 hours.",
							resetAt: err.resetAt,
						}),
						{
							status: 429,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
				throw err;
			}
		}

		const backendPayload = {
			message: text,
			chat_id: userId ? chatId : null,
			trip_context: aiPayload.tripContext ?? null,
			history: messages.slice(0, -1).map((m) => ({
				role: m.role as "user" | "assistant",
				content: m.parts
					.filter((p): p is { type: "text"; text: string } => p.type === "text")
					.map((p) => p.text)
					.join(""),
			})),
		};

		const headers: HeadersInit = {
			"Content-Type": "application/json",
		};
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		const backendRes = await fetch(
			`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/stream`,
			{
				method: "POST",
				headers,
				body: JSON.stringify(backendPayload),
			},
		);

		if (!backendRes.ok || !backendRes.body) {
			const backendText = await backendRes.text();
			console.error("Backend error:", backendRes.status, backendText);
			return new Response("Backend error", {
				status: backendRes.status,
			});
		}

		const responseHeaders: Record<string, string> = {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache, no-transform",
			Connection: "keep-alive",
			"X-Accel-Buffering": "no",
			"x-vercel-ai-ui-message-stream": "v1",
		};
		if (guestRemaining !== null) {
			responseHeaders["X-RateLimit-Remaining"] = String(guestRemaining);
		}

		return new Response(normalizeErrorEvents(backendRes.body), {
			status: 200,
			headers: responseHeaders,
		});
	} catch (error: unknown) {
		if (error instanceof Error && error.message === "aborted") {
			return new Response(null, { status: 499 });
		}
		console.error("Chat route error:", error);
		return new Response("Internal server error", { status: 500 });
	}
}
