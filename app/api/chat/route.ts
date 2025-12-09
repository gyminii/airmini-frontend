import { NextRequest } from "next/server";
import type { UIMessage } from "ai";
import { auth } from "@clerk/nextjs/server";
import type { TripContext } from "@/components/chat-interface/trip-context-dialog";

export const maxDuration = 60;

type AIRequestPayload = {
	id: string;
	messages: UIMessage[];
	tripContext?: TripContext | null;
};

export async function POST(req: NextRequest) {
	try {
		const { getToken } = await auth();
		const token = await getToken();

		const aiPayload = (await req.json()) as AIRequestPayload;
		const messages = aiPayload.messages;
		const last = messages[messages.length - 1];

		const text =
			last?.parts
				?.map((part) => (part.type === "text" ? part.text : ""))
				.join("") ?? "";

		const isAuthenticated = !!token;
		const isValidUUID =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
				aiPayload.id
			);

		// Already in correct format - just pass through
		const backendPayload = {
			message: text,
			chat_id: isAuthenticated && isValidUUID ? aiPayload.id : null,
			trip_context: aiPayload.tripContext ?? null,
		};

		const headers: HeadersInit = {
			"Content-Type": "application/json",
		};

		if (token) {
			headers["Authorization"] = `Bearer ${token}`;
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
			console.error(
				"Backend error:",
				backendRes.status,
				await backendRes.text()
			);
			return new Response("Backend error", { status: backendRes.status });
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
	} catch (error) {
		if (error instanceof Error && error.message === "aborted") {
			console.log("Client disconnected (expected during navigation)");
			return new Response(null, { status: 499 });
		}

		console.error("Chat route error:", error);
		return new Response("Internal server error", { status: 500 });
	}
}
