export interface TripContext {
	ui_language?: "EN" | "KO";
	answer_language?: "EN" | "KO";
	nationality_country_code?: string;
	origin_country_code?: string;
	origin_city_or_airport?: string;
	destination_country_code?: string;
	destination_city_or_airport?: string;
	trip_type?: "one_way" | "round_trip";
	departure_date?: string;
	return_date?: string;
	airline_code?: string;
	cabin?: "economy" | "premium" | "business" | "first";
	purpose?: "tourism" | "business" | "family" | "study" | "other";
}

export interface Message {
	id: string;
	chat_id: string;
	role: "user" | "assistant" | "system";
	content: string;
	created_at: string;
}

export interface ChatSummary {
	id: string;
	title?: string;
	created_at: string;
}

export interface ChatResponse {
	message: string;
	chat_id: string;
	trip_context: TripContext;
	needs_onboarding: boolean;
	source_info?: {
		sources: string[];
		query_type?: string;
	};
}

export interface ChatRequest {
	message: string;
	chat_id?: string;
	trip_context?: TripContext;
	stream?: boolean;
}

export interface ChatUpdate {
	title?: string;
}
