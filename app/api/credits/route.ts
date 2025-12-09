import { getCreditStatus } from "@/lib/actions/credit-manager";

export async function GET() {
	try {
		const status = await getCreditStatus(); // CreditStatus | null

		if (!status) {
			return new Response(
				JSON.stringify({
					credits: null,
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		return new Response(
			JSON.stringify({
				credits: status,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error: unknown) {
		console.error("Credits route error:", error);
		return new Response("Internal server error", { status: 500 });
	}
}
