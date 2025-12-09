import type { CreditStatus } from "@/lib/actions/credit-manager";
import type { AirminiUIMessage } from "@/types/chat";
import type { LucideIcon } from "lucide-react";

export interface InterfaceProps {
	chatData: {
		chat_id: string;
		messages: AirminiUIMessage[];
	};
	isNewChat?: boolean;
	credits?: CreditStatus | null;
}

export interface SuggestionGroup {
	icon: LucideIcon;
	label: string;
	highlight: string;
	items: string[];
}
