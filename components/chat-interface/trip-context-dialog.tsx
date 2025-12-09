"use client";

import * as React from "react";
import {
	Plane,
	Flag,
	MapPin,
	MapPinned,
	Calendar,
	Users,
	X,
} from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

// Match backend schema exactly
export type TripContext = {
	ui_language: "EN" | "KO";
	answer_language: "EN" | "KO";
	nationality_country_code: string | null;
	origin_country_code: string | null;
	origin_city_or_airport: string | null;
	destination_country_code: string | null;
	destination_city_or_airport: string | null;
	trip_type: "one_way" | "round_trip" | null;
	departure_date: string | null;
	return_date: string | null;
	airline_code: string | null;
	cabin: "economy" | "premium" | "business" | "first" | null;
	purpose: "tourism" | "business" | "family" | "study" | "other" | null;
};

const EMPTY_CONTEXT: TripContext = {
	ui_language: "EN",
	answer_language: "EN",
	nationality_country_code: null,
	origin_country_code: null,
	origin_city_or_airport: null,
	destination_country_code: null,
	destination_city_or_airport: null,
	trip_type: null,
	departure_date: null,
	return_date: null,
	airline_code: null,
	cabin: null,
	purpose: null,
};

const NATIONALITIES = [
	{ value: "US", label: "United States" },
	{ value: "KR", label: "South Korea" },
	{ value: "JP", label: "Japan" },
	{ value: "CN", label: "China" },
	{ value: "GB", label: "United Kingdom" },
	{ value: "CA", label: "Canada" },
	{ value: "AU", label: "Australia" },
	{ value: "FR", label: "France" },
	{ value: "DE", label: "Germany" },
	{ value: "IN", label: "India" },
	{ value: "BR", label: "Brazil" },
	{ value: "MX", label: "Mexico" },
];

interface TripContextDialogProps {
	value: TripContext | null;
	onChange: (context: TripContext | null) => void;
}

export function TripContextDialog({ value, onChange }: TripContextDialogProps) {
	const [open, setOpen] = React.useState(false);
	const [draft, setDraft] = React.useState<TripContext>(value ?? EMPTY_CONTEXT);

	const hasContext =
		value &&
		(value.origin_city_or_airport ||
			value.destination_city_or_airport ||
			value.nationality_country_code);

	const filledFields = value
		? Object.values(value).filter((v) => v !== null && v !== "EN").length
		: 0;

	const handleSave = () => {
		// Only save if there's actual data
		const hasData =
			draft.nationality_country_code ||
			draft.origin_city_or_airport ||
			draft.destination_city_or_airport ||
			draft.departure_date;

		onChange(hasData ? draft : null);
		setOpen(false);
	};

	const handleClear = () => {
		setDraft(EMPTY_CONTEXT);
		onChange(null);
		setOpen(false);
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (isOpen) {
			setDraft(value ?? EMPTY_CONTEXT);
		}
		setOpen(isOpen);
	};

	// Helper to set value or null for empty strings
	const setField = <K extends keyof TripContext>(field: K, value: string) => {
		setDraft((prev) => ({
			...prev,
			[field]: value || null,
		}));
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<Tooltip>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<button
							type="button"
							className="relative flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
						>
							<Plane
								className={`size-5 ${
									hasContext ? "text-primary" : "text-muted-foreground"
								}`}
							/>
							{hasContext && (
								<span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
									{filledFields}
								</span>
							)}
						</button>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>
					{hasContext ? "Edit trip details" : "Add trip details"}
				</TooltipContent>
			</Tooltip>

			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<div className="rounded-lg bg-primary/10 p-2 text-primary">
							<Plane className="size-5" />
						</div>
						<div>
							<DialogTitle>Trip Details</DialogTitle>
							<DialogDescription>
								Add context for more accurate answers
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="mt-4 space-y-4">
					{/* Nationality */}
					<div className="space-y-2">
						<Label className="flex items-center gap-2 text-sm">
							<Flag className="size-4 text-muted-foreground" />
							Nationality
						</Label>
						<Select
							value={draft.nationality_country_code ?? ""}
							onValueChange={(val) => setField("nationality_country_code", val)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select your passport country" />
							</SelectTrigger>
							<SelectContent>
								{NATIONALITIES.map((n) => (
									<SelectItem key={n.value} value={n.value}>
										{n.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Origin & Destination */}
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-2">
							<Label className="flex items-center gap-2 text-sm">
								<MapPin className="size-4 text-muted-foreground" />
								From
							</Label>
							<Input
								placeholder="City or airport"
								value={draft.origin_city_or_airport ?? ""}
								onChange={(e) =>
									setField("origin_city_or_airport", e.target.value)
								}
							/>
						</div>
						<div className="space-y-2">
							<Label className="flex items-center gap-2 text-sm">
								<MapPinned className="size-4 text-muted-foreground" />
								To
							</Label>
							<Input
								placeholder="City or airport"
								value={draft.destination_city_or_airport ?? ""}
								onChange={(e) =>
									setField("destination_city_or_airport", e.target.value)
								}
							/>
						</div>
					</div>

					{/* Dates */}
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-2">
							<Label className="flex items-center gap-2 text-sm">
								<Calendar className="size-4 text-muted-foreground" />
								Departure
							</Label>
							<Input
								type="date"
								value={draft.departure_date ?? ""}
								onChange={(e) => {
									setField("departure_date", e.target.value);
									// Auto-set trip type
									if (e.target.value && draft.return_date) {
										setDraft((prev) => ({ ...prev, trip_type: "round_trip" }));
									}
								}}
							/>
						</div>
						<div className="space-y-2">
							<Label className="flex items-center gap-2 text-sm">
								<Calendar className="size-4 text-muted-foreground" />
								Return
							</Label>
							<Input
								type="date"
								value={draft.return_date ?? ""}
								onChange={(e) => {
									setField("return_date", e.target.value);
									// Auto-set trip type
									setDraft((prev) => ({
										...prev,
										return_date: e.target.value || null,
										trip_type: e.target.value ? "round_trip" : "one_way",
									}));
								}}
							/>
						</div>
					</div>

					{/* Purpose */}
					<div className="space-y-2">
						<Label className="flex items-center gap-2 text-sm">
							<Users className="size-4 text-muted-foreground" />
							Purpose
						</Label>
						<Select
							value={draft.purpose ?? ""}
							onValueChange={(val) =>
								setDraft((prev) => ({
									...prev,
									purpose: (val as TripContext["purpose"]) || null,
								}))
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Trip purpose (optional)" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="tourism">Tourism</SelectItem>
								<SelectItem value="business">Business</SelectItem>
								<SelectItem value="family">Family Visit</SelectItem>
								<SelectItem value="study">Study</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Footer */}
				<div className="mt-6 flex items-center justify-between">
					<Button variant="ghost" size="sm" onClick={handleClear}>
						Clear all
					</Button>
					<div className="flex gap-2">
						<Button variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleSave}>Save</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// Badge to show active context in input area
export function TripContextBadge({
	context,
	onClear,
}: {
	context: TripContext;
	onClear: () => void;
}) {
	const parts = [
		context.origin_city_or_airport,
		context.destination_city_or_airport &&
			`→ ${context.destination_city_or_airport}`,
		context.departure_date,
	].filter(Boolean);

	if (parts.length === 0 && !context.nationality_country_code) return null;

	const display =
		parts.length > 0
			? parts.join(" ")
			: `Passport: ${context.nationality_country_code}`;

	return (
		<Badge variant="secondary" className="gap-1 pr-1">
			<Plane className="size-3" />
			<span className="max-w-[200px] truncate">{display}</span>
			<button
				type="button"
				onClick={onClear}
				className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
			>
				<X className="size-3" />
			</button>
		</Badge>
	);
}
