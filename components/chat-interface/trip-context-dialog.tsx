"use client";

import * as React from "react";
import {
	Plane,
	Flag,
	MapPin,
	MapPinned,
	Calendar as CalendarIcon,
	Users,
	X,
} from "lucide-react";
import { format } from "date-fns";

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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { TripContext } from "@/types/chat";

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

const COUNTRIES = [
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

	const [departureOpen, setDepartureOpen] = React.useState(false);
	const [returnOpen, setReturnOpen] = React.useState(false);

	const departureDate = draft.departure_date
		? new Date(draft.departure_date)
		: undefined;
	const returnDate = draft.return_date
		? new Date(draft.return_date)
		: undefined;

	const hasContext =
		value &&
		(value.origin_city_or_airport ||
			value.destination_city_or_airport ||
			value.nationality_country_code ||
			value.origin_country_code ||
			value.destination_country_code);

	const filledFields = value
		? Object.entries(value).filter(([key, v]) => {
				if (key === "ui_language" || key === "answer_language") return false;
				return v !== null;
		  }).length
		: 0;

	const handleSave = () => {
		const hasData =
			draft.nationality_country_code ||
			draft.origin_city_or_airport ||
			draft.destination_city_or_airport ||
			draft.origin_country_code ||
			draft.destination_country_code ||
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

	// Helper: set string or null
	const setField = <K extends keyof TripContext>(field: K, val: string) => {
		setDraft((prev) => ({
			...prev,
			[field]: val || null,
		}));
	};

	const handleDepartureSelect = (date: Date | undefined) => {
		if (!date) {
			setField("departure_date", "");
			setDraft((prev) => ({
				...prev,
				trip_type: prev.return_date ? "round_trip" : null,
			}));
			return;
		}

		const iso = date.toISOString().slice(0, 10);
		setField("departure_date", iso);
		setDraft((prev) => {
			if (prev.return_date) return { ...prev, trip_type: "round_trip" };
			return { ...prev, trip_type: "one_way" };
		});
		setDepartureOpen(false);
	};

	const handleReturnSelect = (date: Date | undefined) => {
		if (!date) {
			setField("return_date", "");
			setDraft((prev) => ({
				...prev,
				return_date: null,
				trip_type: prev.departure_date ? "one_way" : null,
			}));
			return;
		}

		const iso = date.toISOString().slice(0, 10);
		setField("return_date", iso);
		setDraft((prev) => ({
			...prev,
			return_date: iso,
			trip_type: prev.departure_date ? "round_trip" : "one_way",
		}));
		setReturnOpen(false);
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
								className={
									hasContext
										? "size-5 text-primary"
										: "size-5 text-muted-foreground"
								}
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

			<DialogContent className="sm:max-w-[520px]">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<div className="rounded-lg bg-primary/10 p-2 text-primary">
							<Plane className="size-5" />
						</div>
						<div>
							<DialogTitle>Trip Details</DialogTitle>
							<DialogDescription>
								Add context so the assistant can answer with your route in mind.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="mt-4 space-y-4">
					{/* Nationality */}
					<div className="space-y-2">
						<Label className="flex items-center gap-2 text-sm">
							<Flag className="size-4 text-muted-foreground" />
							Passport country
						</Label>
						<Select
							value={draft.nationality_country_code ?? ""}
							onValueChange={(val) => setField("nationality_country_code", val)}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select your passport country" />
							</SelectTrigger>
							<SelectContent>
								{COUNTRIES.map((c) => (
									<SelectItem key={c.value} value={c.value}>
										{c.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Origin & Destination grouped with country + city/airport */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{/* Origin */}
						<div className="space-y-3">
							<Label className="flex items-center gap-2 text-sm">
								<MapPin className="size-4 text-muted-foreground" />
								From
							</Label>
							<div className="space-y-2">
								<Select
									value={draft.origin_country_code ?? ""}
									onValueChange={(val) => setField("origin_country_code", val)}
								>
									<SelectTrigger className="w-full text-xs md:text-sm">
										<SelectValue placeholder="Departure country (optional)" />
									</SelectTrigger>
									<SelectContent>
										{COUNTRIES.map((c) => (
											<SelectItem key={c.value} value={c.value}>
												{c.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Input
									placeholder="City or airport (e.g. Seoul / ICN)"
									value={draft.origin_city_or_airport ?? ""}
									onChange={(e) =>
										setField("origin_city_or_airport", e.target.value)
									}
								/>
							</div>
						</div>

						{/* Destination */}
						<div className="space-y-3">
							<Label className="flex items-center gap-2 text-sm">
								<MapPinned className="size-4 text-muted-foreground" />
								To
							</Label>
							<div className="space-y-2">
								<Select
									value={draft.destination_country_code ?? ""}
									onValueChange={(val) =>
										setField("destination_country_code", val)
									}
								>
									<SelectTrigger className="w-full text-xs md:text-sm">
										<SelectValue placeholder="Arrival country (optional)" />
									</SelectTrigger>
									<SelectContent>
										{COUNTRIES.map((c) => (
											<SelectItem key={c.value} value={c.value}>
												{c.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Input
									placeholder="City or airport (e.g. Vancouver / YVR)"
									value={draft.destination_city_or_airport ?? ""}
									onChange={(e) =>
										setField("destination_city_or_airport", e.target.value)
									}
								/>
							</div>
						</div>
					</div>

					{/* Dates with shadcn calendar */}
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
						<div className="space-y-2">
							<Label className="flex items-center gap-2 text-sm">
								<CalendarIcon className="size-4 text-muted-foreground" />
								Departure
							</Label>
							<Popover open={departureOpen} onOpenChange={setDepartureOpen}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className="w-full justify-between text-left font-normal"
									>
										{departureDate ? (
											format(departureDate, "PPP")
										) : (
											<span className="text-muted-foreground">
												Pick a departure date
											</span>
										)}
										<CalendarIcon className="ml-2 size-4 opacity-60" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={departureDate}
										onSelect={handleDepartureSelect}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>

						<div className="space-y-2">
							<Label className="flex items-center gap-2 text-sm">
								<CalendarIcon className="size-4 text-muted-foreground" />
								Return
							</Label>
							<Popover open={returnOpen} onOpenChange={setReturnOpen}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className="w-full justify-between text-left font-normal"
									>
										{returnDate ? (
											format(returnDate, "PPP")
										) : (
											<span className="text-muted-foreground">
												Pick a return date (optional)
											</span>
										)}
										<CalendarIcon className="ml-2 size-4 opacity-60" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={returnDate}
										onSelect={handleReturnSelect}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
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
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Trip purpose (optional)" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="tourism">Tourism</SelectItem>
								<SelectItem value="business">Business</SelectItem>
								<SelectItem value="family">Family visit</SelectItem>
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
	const fromParts = [
		context.origin_city_or_airport,
		context.origin_country_code && `(${context.origin_country_code})`,
	].filter(Boolean);

	const toParts = [
		context.destination_city_or_airport,
		context.destination_country_code && `(${context.destination_country_code})`,
	].filter(Boolean);

	let main: string | null = null;

	if (fromParts.length || toParts.length) {
		const from = fromParts.join(" ");
		const to = toParts.join(" ");
		main = from && to ? `${from} → ${to}` : from || to;
	}

	if (!main && !context.nationality_country_code) return null;

	const display =
		main ?? `Passport: ${context.nationality_country_code ?? ""}`.trim();

	return (
		<Badge variant="secondary" className="gap-1 pr-1">
			<Plane className="size-3" />
			<span className="max-w-[220px] truncate">{display}</span>
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
