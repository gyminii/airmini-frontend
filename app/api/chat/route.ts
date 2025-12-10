import { NextRequest } from "next/server";
import type { UIMessage } from "ai";
import { auth } from "@clerk/nextjs/server";
import { managerCredits } from "@/lib/actions/credit-manager";
import { TripContext } from "@/types/chat";

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
				aiPayload.id
			);

		let chatId: string | null = null;

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
						}
					);
				}
				throw err;
			}
		}

		const backendPayload = {
			message: text,
			chat_id: userId ? chatId : null,
			trip_context: aiPayload.tripContext ?? null,
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
			}
		);

		if (!backendRes.ok || !backendRes.body) {
			const backendText = await backendRes.text();
			console.error("Backend error:", backendRes.status, backendText);
			return new Response("Backend error", {
				status: backendRes.status,
			});
		}

		return new Response(backendRes.body, {
			status: 200,
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache, no-transform",
				Connection: "keep-alive",
				"X-Accel-Buffering": "no",
				"x-vercel-ai-ui-message-stream": "v1",
			},
		});
	} catch (error: unknown) {
		if (error instanceof Error && error.message === "aborted") {
			return new Response(null, { status: 499 });
		}
		console.error("Chat route error:", error);
		return new Response("Internal server error", { status: 500 });
	}
}
