import type { UIMessage } from "ai";

export function exportChatAsText(messages: UIMessage[], chatTitle?: string): void {
	const lines: string[] = [];

	if (chatTitle) {
		lines.push(`# ${chatTitle}`);
		lines.push("=".repeat(chatTitle.length + 2));
		lines.push("");
	}

	for (const message of messages) {
		const role = message.role === "user" ? "You" : "Airmini";
		const text = message.parts
			.filter((p) => p.type === "text")
			.map((p) => (p.type === "text" ? p.text : ""))
			.join("");

		if (!text.trim()) continue;

		lines.push(`[${role}]`);
		lines.push(text.trim());
		lines.push("");
	}

	const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${chatTitle ?? "airmini-chat"}.txt`;
	a.click();
	URL.revokeObjectURL(url);
}
