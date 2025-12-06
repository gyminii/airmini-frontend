import { NextRequest } from "next/server";
import type { UIMessage } from "ai";
import { auth } from "@clerk/nextjs/server";

export const runtime = "edge";

type AIRequestPayload = {
	id: string;
	messages: UIMessage[];
};

export async function POST(req: NextRequest) {
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

	const backendPayload = {
		message: text,
		chat_id: isAuthenticated && isValidUUID ? aiPayload.id : null,
		trip_context: null,
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
		return new Response("Backend error", { status: backendRes.status });
	}

	return new Response(backendRes.body, {
		status: 200,
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
			"x-vercel-ai-ui-message-stream": "v1",
		},
	});
}
