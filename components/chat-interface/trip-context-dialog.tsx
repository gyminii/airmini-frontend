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
	Languages,
	Check,
	ChevronsUpDown,
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
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { TripContext } from "@/types/chat";
import { COUNTRIES } from "@/lib/data/countries";
import { AIRLINES } from "@/lib/data/airlines";

function flagEmoji(code: string): string {
	return code
		.toUpperCase()
		.split("")
		.map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
		.join("");
}

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

function CountrySelect({
	value,
	onChange,
	placeholder,
}: {
	value: string | null;
	onChange: (val: string) => void;
	placeholder: string;
}) {
	const [open, setOpen] = React.useState(false);
	const selected = COUNTRIES.find((c) => c.value === value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					className="w-full justify-between font-normal text-xs md:text-sm"
				>
					{selected ? (
						<span className="flex items-center gap-2">
							<span>{flagEmoji(selected.value)}</span>
							{selected.label}
						</span>
					) : (
						<span className="text-muted-foreground">{placeholder}</span>
					)}
					<ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[min(280px,90vw)] p-0" align="start">
				<Command className="overflow-visible">
					<CommandInput placeholder="Search country..." />
					<CommandList
						className="max-h-60 overflow-y-scroll"
						onWheelCapture={(e) => e.stopPropagation()}
					>
						<CommandEmpty>No country found.</CommandEmpty>
						<CommandGroup>
							{COUNTRIES.map((c) => (
								<CommandItem
									key={c.value}
									value={c.label}
									onSelect={() => {
										onChange(c.value);
										setOpen(false);
									}}
								>
									<span className="mr-2">{flagEmoji(c.value)}</span>
									{c.label}
									{value === c.value && (
										<Check className="ml-auto size-4 opacity-100" />
									)}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

function AirlineSelect({
	value,
	onChange,
}: {
	value: string | null;
	onChange: (val: string) => void;
}) {
	const [open, setOpen] = React.useState(false);
	const selected = AIRLINES.find((a) => a.value === value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					className="w-full justify-between font-normal text-sm"
				>
					{selected?.label ?? (
						<span className="text-muted-foreground">
							Select airline (optional)
						</span>
					)}
					<ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[min(320px,90vw)] p-0" align="start">
				<Command className="overflow-visible">
					<CommandInput placeholder="Search airline..." />
					<CommandList
						className="max-h-60 overflow-y-scroll"
						onWheelCapture={(e) => e.stopPropagation()}
					>
						<CommandEmpty>No airline found.</CommandEmpty>
						<CommandGroup>
							{AIRLINES.map((a) => (
								<CommandItem
									key={a.value}
									value={a.label}
									onSelect={() => {
										onChange(a.value);
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											"mr-2 size-4",
											value === a.value ? "opacity-100" : "opacity-0",
										)}
									/>
									{a.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

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
		if (isOpen) setDraft(value ?? EMPTY_CONTEXT);
		setOpen(isOpen);
	};

	const setField = <K extends keyof TripContext>(field: K, val: string) => {
		setDraft((prev) => ({ ...prev, [field]: val || null }));
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
		setDraft((prev) => ({
			...prev,
			trip_type: prev.return_date ? "round_trip" : "one_way",
		}));
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
							aria-label={hasContext ? "Edit trip details" : "Add trip details"}
							className="relative flex size-10 items-center justify-center rounded-full transition-colors hover:bg-muted"
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

			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[540px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Plane className="size-5 text-primary" />
						Trip Details
					</DialogTitle>
					<DialogDescription>
						Add context so the assistant can answer with your situation in mind.
					</DialogDescription>
				</DialogHeader>

				<div className="mt-4 space-y-4">
					{/* Response language toggle */}
					<div className="flex items-center justify-between rounded-lg border p-3">
						<Label className="flex items-center gap-2 text-sm">
							<Languages className="size-4 text-muted-foreground" />
							Response language
						</Label>
						<div
							role="group"
							aria-label="Response language"
							className="flex overflow-hidden rounded-md border"
						>
							<button
								type="button"
								aria-pressed={draft.answer_language === "EN"}
								onClick={() =>
									setDraft((p) => ({ ...p, answer_language: "EN" }))
								}
								className={cn(
									"px-3 py-1 text-sm transition-colors",
									draft.answer_language === "EN"
										? "bg-primary text-primary-foreground"
										: "hover:bg-muted",
								)}
							>
								EN
							</button>
							<button
								type="button"
								aria-pressed={draft.answer_language === "KO"}
								onClick={() =>
									setDraft((p) => ({ ...p, answer_language: "KO" }))
								}
								className={cn(
									"px-3 py-1 text-sm transition-colors",
									draft.answer_language === "KO"
										? "bg-primary text-primary-foreground"
										: "hover:bg-muted",
								)}
							>
								한국어
							</button>
						</div>
					</div>

					{/* Nationality */}
					<div className="space-y-2">
						<Label className="flex items-center gap-2 text-sm">
							<Flag className="size-4 text-muted-foreground" />
							Passport country
						</Label>
						<CountrySelect
							value={draft.nationality_country_code}
							onChange={(val) => setField("nationality_country_code", val)}
							placeholder="Select your passport country"
						/>
					</div>

					{/* Origin & Destination */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-3">
							<Label className="flex items-center gap-2 text-sm">
								<MapPin className="size-4 text-muted-foreground" />
								From
							</Label>
							<div className="space-y-2">
								<CountrySelect
									value={draft.origin_country_code}
									onChange={(val) => setField("origin_country_code", val)}
									placeholder="Departure country"
								/>
								<Input
									placeholder="City or airport (e.g. Seoul / ICN)"
									value={draft.origin_city_or_airport ?? ""}
									onChange={(e) =>
										setField("origin_city_or_airport", e.target.value)
									}
								/>
							</div>
						</div>
						<div className="space-y-3">
							<Label className="flex items-center gap-2 text-sm">
								<MapPinned className="size-4 text-muted-foreground" />
								To
							</Label>
							<div className="space-y-2">
								<CountrySelect
									value={draft.destination_country_code}
									onChange={(val) => setField("destination_country_code", val)}
									placeholder="Arrival country"
								/>
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

					{/* Dates */}
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
											<span className="text-muted-foreground">Pick a date</span>
										)}
										<CalendarIcon className="ml-2 size-4 opacity-60" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={departureDate}
										onSelect={handleDepartureSelect}
										autoFocus
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
												Return date (optional)
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
										autoFocus
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>

					{/* Airline + Cabin */}
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
						<div className="space-y-2">
							<Label className="flex items-center gap-2 text-sm">
								<Plane className="size-4 text-muted-foreground" />
								Airline
							</Label>
							<AirlineSelect
								value={draft.airline_code}
								onChange={(val) => setField("airline_code", val)}
							/>
						</div>
						<div className="space-y-2">
							<Label className="text-sm">Cabin class</Label>
							<Select
								value={draft.cabin ?? ""}
								onValueChange={(val) =>
									setDraft((prev) => ({
										...prev,
										cabin: (val as TripContext["cabin"]) || null,
									}))
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Cabin (optional)" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="economy">Economy</SelectItem>
									<SelectItem value="premium">Premium Economy</SelectItem>
									<SelectItem value="business">Business</SelectItem>
									<SelectItem value="first">First Class</SelectItem>
								</SelectContent>
							</Select>
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
				aria-label="Clear trip context"
				className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
			>
				<X className="size-3" />
			</button>
		</Badge>
	);
}
