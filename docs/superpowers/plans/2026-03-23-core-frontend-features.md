# Core Frontend Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all frontend-only features: expanded trip dialog (countries, airline, cabin, language), regenerate response, chat export, follow-up suggestions after AI reply, and keyboard shortcuts.

**Architecture:** Each feature is self-contained. Features touching the trip dialog share a new `lib/data/` module for countries and airlines. The regenerate and follow-up features thread through the existing hook → interface → message-list chain. No new pages, no backend changes.

**Tech Stack:** Next.js App Router, React, Vercel AI SDK (`useChat`), Tailwind, shadcn/ui, TypeScript

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `lib/data/countries.ts` | Create | Full ISO country list (250+) for trip dialog selects |
| `lib/data/airlines.ts` | Create | Common IATA airline codes with names for autocomplete |
| `lib/utils/export-chat.ts` | Create | Format messages array → plain text for download |
| `lib/utils/follow-ups.ts` | Create | Generate contextual follow-up chips from thought phases |
| `components/chat-interface/trip-context-dialog.tsx` | Modify | Add cabin, airline, language toggle; swap 12-country list for full list |
| `hooks/use-chat-interface.ts` | Modify | Expose `handleRegenerate` from SDK `reload()` |
| `components/chat-interface/interface.tsx` | Modify | Wire regenerate, export, follow-ups; add keyboard shortcut |
| `components/chat-interface/components/assistant-message.tsx` | Modify | Add Regenerate button; accept + display follow-up chips |
| `components/chat-interface/components/message-list.tsx` | Modify | Pass `onRegenerate` and follow-up props to last assistant message |

---

## Task 1: Country & Airline Data Modules

**Files:**
- Create: `lib/data/countries.ts`
- Create: `lib/data/airlines.ts`

- [ ] **Step 1: Create countries.ts with full ISO list**

```ts
// lib/data/countries.ts
export const COUNTRIES: { value: string; label: string }[] = [
  { value: "AF", label: "Afghanistan" },
  { value: "AL", label: "Albania" },
  { value: "DZ", label: "Algeria" },
  { value: "AD", label: "Andorra" },
  { value: "AO", label: "Angola" },
  { value: "AG", label: "Antigua and Barbuda" },
  { value: "AR", label: "Argentina" },
  { value: "AM", label: "Armenia" },
  { value: "AU", label: "Australia" },
  { value: "AT", label: "Austria" },
  { value: "AZ", label: "Azerbaijan" },
  { value: "BS", label: "Bahamas" },
  { value: "BH", label: "Bahrain" },
  { value: "BD", label: "Bangladesh" },
  { value: "BB", label: "Barbados" },
  { value: "BY", label: "Belarus" },
  { value: "BE", label: "Belgium" },
  { value: "BZ", label: "Belize" },
  { value: "BJ", label: "Benin" },
  { value: "BT", label: "Bhutan" },
  { value: "BO", label: "Bolivia" },
  { value: "BA", label: "Bosnia and Herzegovina" },
  { value: "BW", label: "Botswana" },
  { value: "BR", label: "Brazil" },
  { value: "BN", label: "Brunei" },
  { value: "BG", label: "Bulgaria" },
  { value: "BF", label: "Burkina Faso" },
  { value: "BI", label: "Burundi" },
  { value: "CV", label: "Cabo Verde" },
  { value: "KH", label: "Cambodia" },
  { value: "CM", label: "Cameroon" },
  { value: "CA", label: "Canada" },
  { value: "CF", label: "Central African Republic" },
  { value: "TD", label: "Chad" },
  { value: "CL", label: "Chile" },
  { value: "CN", label: "China" },
  { value: "CO", label: "Colombia" },
  { value: "KM", label: "Comoros" },
  { value: "CG", label: "Congo" },
  { value: "CD", label: "Congo (DRC)" },
  { value: "CR", label: "Costa Rica" },
  { value: "CI", label: "Côte d'Ivoire" },
  { value: "HR", label: "Croatia" },
  { value: "CU", label: "Cuba" },
  { value: "CY", label: "Cyprus" },
  { value: "CZ", label: "Czech Republic" },
  { value: "DK", label: "Denmark" },
  { value: "DJ", label: "Djibouti" },
  { value: "DM", label: "Dominica" },
  { value: "DO", label: "Dominican Republic" },
  { value: "EC", label: "Ecuador" },
  { value: "EG", label: "Egypt" },
  { value: "SV", label: "El Salvador" },
  { value: "GQ", label: "Equatorial Guinea" },
  { value: "ER", label: "Eritrea" },
  { value: "EE", label: "Estonia" },
  { value: "SZ", label: "Eswatini" },
  { value: "ET", label: "Ethiopia" },
  { value: "FJ", label: "Fiji" },
  { value: "FI", label: "Finland" },
  { value: "FR", label: "France" },
  { value: "GA", label: "Gabon" },
  { value: "GM", label: "Gambia" },
  { value: "GE", label: "Georgia" },
  { value: "DE", label: "Germany" },
  { value: "GH", label: "Ghana" },
  { value: "GR", label: "Greece" },
  { value: "GD", label: "Grenada" },
  { value: "GT", label: "Guatemala" },
  { value: "GN", label: "Guinea" },
  { value: "GW", label: "Guinea-Bissau" },
  { value: "GY", label: "Guyana" },
  { value: "HT", label: "Haiti" },
  { value: "HN", label: "Honduras" },
  { value: "HU", label: "Hungary" },
  { value: "IS", label: "Iceland" },
  { value: "IN", label: "India" },
  { value: "ID", label: "Indonesia" },
  { value: "IR", label: "Iran" },
  { value: "IQ", label: "Iraq" },
  { value: "IE", label: "Ireland" },
  { value: "IL", label: "Israel" },
  { value: "IT", label: "Italy" },
  { value: "JM", label: "Jamaica" },
  { value: "JP", label: "Japan" },
  { value: "JO", label: "Jordan" },
  { value: "KZ", label: "Kazakhstan" },
  { value: "KE", label: "Kenya" },
  { value: "KI", label: "Kiribati" },
  { value: "KP", label: "North Korea" },
  { value: "KR", label: "South Korea" },
  { value: "KW", label: "Kuwait" },
  { value: "KG", label: "Kyrgyzstan" },
  { value: "LA", label: "Laos" },
  { value: "LV", label: "Latvia" },
  { value: "LB", label: "Lebanon" },
  { value: "LS", label: "Lesotho" },
  { value: "LR", label: "Liberia" },
  { value: "LY", label: "Libya" },
  { value: "LI", label: "Liechtenstein" },
  { value: "LT", label: "Lithuania" },
  { value: "LU", label: "Luxembourg" },
  { value: "MG", label: "Madagascar" },
  { value: "MW", label: "Malawi" },
  { value: "MY", label: "Malaysia" },
  { value: "MV", label: "Maldives" },
  { value: "ML", label: "Mali" },
  { value: "MT", label: "Malta" },
  { value: "MH", label: "Marshall Islands" },
  { value: "MR", label: "Mauritania" },
  { value: "MU", label: "Mauritius" },
  { value: "MX", label: "Mexico" },
  { value: "FM", label: "Micronesia" },
  { value: "MD", label: "Moldova" },
  { value: "MC", label: "Monaco" },
  { value: "MN", label: "Mongolia" },
  { value: "ME", label: "Montenegro" },
  { value: "MA", label: "Morocco" },
  { value: "MZ", label: "Mozambique" },
  { value: "MM", label: "Myanmar" },
  { value: "NA", label: "Namibia" },
  { value: "NR", label: "Nauru" },
  { value: "NP", label: "Nepal" },
  { value: "NL", label: "Netherlands" },
  { value: "NZ", label: "New Zealand" },
  { value: "NI", label: "Nicaragua" },
  { value: "NE", label: "Niger" },
  { value: "NG", label: "Nigeria" },
  { value: "MK", label: "North Macedonia" },
  { value: "NO", label: "Norway" },
  { value: "OM", label: "Oman" },
  { value: "PK", label: "Pakistan" },
  { value: "PW", label: "Palau" },
  { value: "PA", label: "Panama" },
  { value: "PG", label: "Papua New Guinea" },
  { value: "PY", label: "Paraguay" },
  { value: "PE", label: "Peru" },
  { value: "PH", label: "Philippines" },
  { value: "PL", label: "Poland" },
  { value: "PT", label: "Portugal" },
  { value: "QA", label: "Qatar" },
  { value: "RO", label: "Romania" },
  { value: "RU", label: "Russia" },
  { value: "RW", label: "Rwanda" },
  { value: "KN", label: "Saint Kitts and Nevis" },
  { value: "LC", label: "Saint Lucia" },
  { value: "VC", label: "Saint Vincent and the Grenadines" },
  { value: "WS", label: "Samoa" },
  { value: "SM", label: "San Marino" },
  { value: "ST", label: "São Tomé and Príncipe" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "SN", label: "Senegal" },
  { value: "RS", label: "Serbia" },
  { value: "SC", label: "Seychelles" },
  { value: "SL", label: "Sierra Leone" },
  { value: "SG", label: "Singapore" },
  { value: "SK", label: "Slovakia" },
  { value: "SI", label: "Slovenia" },
  { value: "SB", label: "Solomon Islands" },
  { value: "SO", label: "Somalia" },
  { value: "ZA", label: "South Africa" },
  { value: "SS", label: "South Sudan" },
  { value: "ES", label: "Spain" },
  { value: "LK", label: "Sri Lanka" },
  { value: "SD", label: "Sudan" },
  { value: "SR", label: "Suriname" },
  { value: "SE", label: "Sweden" },
  { value: "CH", label: "Switzerland" },
  { value: "SY", label: "Syria" },
  { value: "TW", label: "Taiwan" },
  { value: "TJ", label: "Tajikistan" },
  { value: "TZ", label: "Tanzania" },
  { value: "TH", label: "Thailand" },
  { value: "TL", label: "Timor-Leste" },
  { value: "TG", label: "Togo" },
  { value: "TO", label: "Tonga" },
  { value: "TT", label: "Trinidad and Tobago" },
  { value: "TN", label: "Tunisia" },
  { value: "TR", label: "Turkey" },
  { value: "TM", label: "Turkmenistan" },
  { value: "TV", label: "Tuvalu" },
  { value: "UG", label: "Uganda" },
  { value: "UA", label: "Ukraine" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "UY", label: "Uruguay" },
  { value: "UZ", label: "Uzbekistan" },
  { value: "VU", label: "Vanuatu" },
  { value: "VE", label: "Venezuela" },
  { value: "VN", label: "Vietnam" },
  { value: "YE", label: "Yemen" },
  { value: "ZM", label: "Zambia" },
  { value: "ZW", label: "Zimbabwe" },
];
```

- [ ] **Step 2: Create airlines.ts with common IATA codes**

```ts
// lib/data/airlines.ts
export const AIRLINES: { value: string; label: string }[] = [
  { value: "AA", label: "American Airlines (AA)" },
  { value: "AC", label: "Air Canada (AC)" },
  { value: "AF", label: "Air France (AF)" },
  { value: "AI", label: "Air India (AI)" },
  { value: "AK", label: "AirAsia (AK)" },
  { value: "AM", label: "Aeromexico (AM)" },
  { value: "AS", label: "Alaska Airlines (AS)" },
  { value: "AV", label: "Avianca (AV)" },
  { value: "AY", label: "Finnair (AY)" },
  { value: "AZ", label: "ITA Airways (AZ)" },
  { value: "B6", label: "JetBlue (B6)" },
  { value: "BA", label: "British Airways (BA)" },
  { value: "BR", label: "EVA Air (BR)" },
  { value: "CA", label: "Air China (CA)" },
  { value: "CI", label: "China Airlines (CI)" },
  { value: "CX", label: "Cathay Pacific (CX)" },
  { value: "CZ", label: "China Southern (CZ)" },
  { value: "DL", label: "Delta Air Lines (DL)" },
  { value: "EK", label: "Emirates (EK)" },
  { value: "ET", label: "Ethiopian Airlines (ET)" },
  { value: "EY", label: "Etihad Airways (EY)" },
  { value: "FX", label: "FedEx Express (FX)" },
  { value: "FZ", label: "flydubai (FZ)" },
  { value: "G3", label: "Gol Airlines (G3)" },
  { value: "GA", label: "Garuda Indonesia (GA)" },
  { value: "GF", label: "Gulf Air (GF)" },
  { value: "HA", label: "Hawaiian Airlines (HA)" },
  { value: "HU", label: "Hainan Airlines (HU)" },
  { value: "IB", label: "Iberia (IB)" },
  { value: "JJ", label: "LATAM Brasil (JJ)" },
  { value: "JL", label: "Japan Airlines (JL)" },
  { value: "JQ", label: "Jetstar (JQ)" },
  { value: "KE", label: "Korean Air (KE)" },
  { value: "KL", label: "KLM (KL)" },
  { value: "KQ", label: "Kenya Airways (KQ)" },
  { value: "LA", label: "LATAM Airlines (LA)" },
  { value: "LH", label: "Lufthansa (LH)" },
  { value: "LO", label: "LOT Polish Airlines (LO)" },
  { value: "LX", label: "Swiss (LX)" },
  { value: "MH", label: "Malaysia Airlines (MH)" },
  { value: "MK", label: "Air Mauritius (MK)" },
  { value: "MS", label: "EgyptAir (MS)" },
  { value: "MU", label: "China Eastern (MU)" },
  { value: "NH", label: "ANA (NH)" },
  { value: "NZ", label: "Air New Zealand (NZ)" },
  { value: "OA", label: "Olympic Air (OA)" },
  { value: "OZ", label: "Asiana Airlines (OZ)" },
  { value: "PK", label: "Pakistan International Airlines (PK)" },
  { value: "PR", label: "Philippine Airlines (PR)" },
  { value: "QF", label: "Qantas (QF)" },
  { value: "QR", label: "Qatar Airways (QR)" },
  { value: "RJ", label: "Royal Jordanian (RJ)" },
  { value: "RO", label: "TAROM (RO)" },
  { value: "S7", label: "S7 Airlines (S7)" },
  { value: "SA", label: "South African Airways (SA)" },
  { value: "SK", label: "SAS (SK)" },
  { value: "SN", label: "Brussels Airlines (SN)" },
  { value: "SQ", label: "Singapore Airlines (SQ)" },
  { value: "SU", label: "Aeroflot (SU)" },
  { value: "SV", label: "Saudia (SV)" },
  { value: "TG", label: "Thai Airways (TG)" },
  { value: "TK", label: "Turkish Airlines (TK)" },
  { value: "TP", label: "TAP Air Portugal (TP)" },
  { value: "TW", label: "T'way Air (TW)" },
  { value: "UA", label: "United Airlines (UA)" },
  { value: "UL", label: "SriLankan Airlines (UL)" },
  { value: "UX", label: "Air Europa (UX)" },
  { value: "VN", label: "Vietnam Airlines (VN)" },
  { value: "VS", label: "Virgin Atlantic (VS)" },
  { value: "VY", label: "Vueling (VY)" },
  { value: "WN", label: "Southwest Airlines (WN)" },
  { value: "WS", label: "WestJet (WS)" },
  { value: "XF", label: "Vladivostok Air (XF)" },
  { value: "ZH", label: "Shenzhen Airlines (ZH)" },
];
```

- [ ] **Step 3: Commit data modules**

```bash
git add lib/data/countries.ts lib/data/airlines.ts
git commit -m "feat: add full country and airline data modules"
```

---

## Task 2: Upgrade Trip Context Dialog

**Files:**
- Modify: `components/chat-interface/trip-context-dialog.tsx`

Replace the 12-country hardcoded list with `COUNTRIES` from `lib/data/countries.ts`. Add a searchable combobox for country selects. Add `airline_code` field with airline autocomplete. Add `cabin` select. Add `answer_language` toggle (EN/KO).

- [ ] **Step 1: Replace country list and add missing fields**

Replace the entire `trip-context-dialog.tsx` content:

```tsx
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
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { TripContext } from "@/types/chat";
import { COUNTRIES } from "@/lib/data/countries";
import { AIRLINES } from "@/lib/data/airlines";

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

// Searchable combobox for countries
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
          {selected?.label ?? (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
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
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === c.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {c.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Searchable combobox for airlines
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
            <span className="text-muted-foreground">Select airline (optional)</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search airline..." />
          <CommandList>
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
                      value === a.value ? "opacity-100" : "opacity-0"
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

  const departureDate = draft.departure_date ? new Date(draft.departure_date) : undefined;
  const returnDate = draft.return_date ? new Date(draft.return_date) : undefined;

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
      setDraft((prev) => ({ ...prev, trip_type: prev.return_date ? "round_trip" : null }));
      return;
    }
    const iso = date.toISOString().slice(0, 10);
    setField("departure_date", iso);
    setDraft((prev) => ({ ...prev, trip_type: prev.return_date ? "round_trip" : "one_way" }));
    setDepartureOpen(false);
  };

  const handleReturnSelect = (date: Date | undefined) => {
    if (!date) {
      setField("return_date", "");
      setDraft((prev) => ({ ...prev, return_date: null, trip_type: prev.departure_date ? "one_way" : null }));
      return;
    }
    const iso = date.toISOString().slice(0, 10);
    setDraft((prev) => ({ ...prev, return_date: iso, trip_type: prev.departure_date ? "round_trip" : "one_way" }));
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
                className={hasContext ? "size-5 text-primary" : "size-5 text-muted-foreground"}
              />
              {hasContext && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {filledFields}
                </span>
              )}
            </button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>{hasContext ? "Edit trip details" : "Add trip details"}</TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
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
          {/* Answer Language */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label className="flex items-center gap-2 text-sm">
              <Languages className="size-4 text-muted-foreground" />
              Response language
            </Label>
            <div className="flex rounded-md border overflow-hidden">
              <button
                type="button"
                onClick={() => setDraft((p) => ({ ...p, answer_language: "EN" }))}
                className={cn(
                  "px-3 py-1 text-sm transition-colors",
                  draft.answer_language === "EN"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setDraft((p) => ({ ...p, answer_language: "KO" }))}
                className={cn(
                  "px-3 py-1 text-sm transition-colors",
                  draft.answer_language === "KO"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
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
                  onChange={(e) => setField("origin_city_or_airport", e.target.value)}
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
                  onChange={(e) => setField("destination_city_or_airport", e.target.value)}
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
                  <Button variant="outline" className="w-full justify-between text-left font-normal">
                    {departureDate ? format(departureDate, "PPP") : (
                      <span className="text-muted-foreground">Pick a date</span>
                    )}
                    <CalendarIcon className="ml-2 size-4 opacity-60" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={departureDate} onSelect={handleDepartureSelect} initialFocus />
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
                  <Button variant="outline" className="w-full justify-between text-left font-normal">
                    {returnDate ? format(returnDate, "PPP") : (
                      <span className="text-muted-foreground">Return date (optional)</span>
                    )}
                    <CalendarIcon className="ml-2 size-4 opacity-60" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={returnDate} onSelect={handleReturnSelect} initialFocus />
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
                  setDraft((prev) => ({ ...prev, cabin: (val as TripContext["cabin"]) || null }))
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
                setDraft((prev) => ({ ...prev, purpose: (val as TripContext["purpose"]) || null }))
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
          <Button variant="ghost" size="sm" onClick={handleClear}>Clear all</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
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

  const display = main ?? `Passport: ${context.nationality_country_code ?? ""}`.trim();

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
```

- [ ] **Step 2: Verify `Command` component exists in shadcn**

```bash
ls components/ui/command.tsx
```

If missing, install it:
```bash
npx shadcn@latest add command
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add components/chat-interface/trip-context-dialog.tsx
git commit -m "feat: upgrade trip dialog with full country/airline search, cabin class, and language toggle"
```

---

## Task 3: Regenerate Response

**Files:**
- Modify: `hooks/use-chat-interface.ts`
- Modify: `components/chat-interface/components/assistant-message.tsx`
- Modify: `components/chat-interface/components/message-list.tsx`
- Modify: `components/chat-interface/interface.tsx`

The AI SDK's `useChat` exposes a `reload()` function that re-sends the last user message. We expose it as `handleRegenerate` from the hook, pass it down through `interface.tsx` → `MessageList` → `AssistantMessage`.

- [ ] **Step 1: Expose `handleRegenerate` from the hook**

In `hooks/use-chat-interface.ts`, destructure `reload` from `useChat` and expose it:

```ts
const { messages, sendMessage, status, reload } = useChat({ ... });

const handleRegenerate = useCallback(() => {
  if (isStreaming) return;
  reload();
}, [isStreaming, reload]);
```

Add `handleRegenerate` to the return object.

- [ ] **Step 2: Thread `handleRegenerate` through interface.tsx**

In `interface.tsx`:
1. Destructure `handleRegenerate` from `useChatInterface`
2. Pass it to `MessageList` as `onRegenerate={handleRegenerate}`

- [ ] **Step 3: Add `onRegenerate` prop to MessageList**

In `components/chat-interface/components/message-list.tsx`:

Add `onRegenerate: () => void` to `MessageListProps`.

Pass it to `AssistantMessage` only for the last assistant message:
```tsx
<AssistantMessage
  parts={message.parts as UIPart[]}
  isStreaming={isMessageStreaming}
  onRegenerate={isLastMessage ? onRegenerate : undefined}
/>
```

- [ ] **Step 4: Add Regenerate button to AssistantMessage**

In `components/chat-interface/components/assistant-message.tsx`:

Add `onRegenerate?: () => void` to `AssistantMessageProps`.

Add a regenerate button next to the copy button in `MessageActions`:
```tsx
import { CopyIcon, RefreshCwIcon } from "lucide-react";

{onRegenerate && (
  <MessageAction tooltip="Regenerate" delayDuration={100}>
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={onRegenerate}
    >
      <RefreshCwIcon />
    </Button>
  </MessageAction>
)}
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add hooks/use-chat-interface.ts components/chat-interface/interface.tsx \
  components/chat-interface/components/message-list.tsx \
  components/chat-interface/components/assistant-message.tsx
git commit -m "feat: add regenerate response button on last assistant message"
```

---

## Task 4: Chat Export

**Files:**
- Create: `lib/utils/export-chat.ts`
- Modify: `components/chat-interface/interface.tsx`

Export downloads the current conversation as a plain `.txt` file. The button lives in the chat toolbar area (top of chat, only visible when there are messages).

- [ ] **Step 1: Create export utility**

```ts
// lib/utils/export-chat.ts
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
```

- [ ] **Step 2: Add export button to interface.tsx**

Add an export button that appears when `!isFirstResponse`. Place it in the top-right area of the chat:

```tsx
import { exportChatAsText } from "@/lib/utils/export-chat";
import { DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";

// Inside the return JSX, replace <div className="h-10" /> with:
<div className="h-10 w-full flex items-center justify-end px-2">
  {!isFirstResponse && (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-full"
          onClick={() => exportChatAsText(messages)}
        >
          <DownloadIcon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Export chat</TooltipContent>
    </Tooltip>
  )}
</div>
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add lib/utils/export-chat.ts components/chat-interface/interface.tsx
git commit -m "feat: add chat export as plain text download"
```

---

## Task 5: Follow-up Suggestions After AI Reply

**Files:**
- Create: `lib/utils/follow-ups.ts`
- Modify: `components/chat-interface/components/assistant-message.tsx`
- Modify: `components/chat-interface/components/message-list.tsx`
- Modify: `components/chat-interface/interface.tsx`

After the last assistant message finishes streaming, show 3 clickable follow-up chips. They are generated from the thought phases present in the message. Clicking a chip populates the input and focuses it.

- [ ] **Step 1: Create follow-up generator**

```ts
// lib/utils/follow-ups.ts
import type { ThoughtPhase } from "@/types/chat";

const PHASE_FOLLOWUPS: Record<ThoughtPhase, string[]> = {
  visa: [
    "What documents do I need for this visa?",
    "How long does this visa take to process?",
    "Can I extend this visa once I arrive?",
    "Is a visa on arrival available?",
  ],
  search: [
    "What are the latest updates on this?",
    "Are there any exceptions to this rule?",
    "Where can I find the official source for this?",
  ],
  knowledge: [
    "What are the baggage allowance details?",
    "Are there any restrictions I should know about?",
    "What happens if I exceed the limit?",
  ],
  analysis: [
    "Can you explain this in more detail?",
    "What does this mean for my specific trip?",
    "Are there alternatives I should consider?",
  ],
  validation: [
    "Are there any exceptions to this?",
    "How recent is this information?",
    "Should I double-check this with the airline?",
  ],
  other: [
    "Can you tell me more about this?",
    "What should I do next?",
    "Are there any important warnings I should know?",
  ],
};

export function generateFollowUps(phases: ThoughtPhase[]): string[] {
  if (phases.length === 0) {
    return PHASE_FOLLOWUPS.other.slice(0, 3);
  }

  // Primary phase determines suggestions
  const primary = phases[0];
  const pool = PHASE_FOLLOWUPS[primary] ?? PHASE_FOLLOWUPS.other;

  // Pick 3 distinct suggestions
  return pool.slice(0, 3);
}
```

- [ ] **Step 2: Add follow-up chips to AssistantMessage**

Update `AssistantMessageProps` to accept:
```ts
showFollowUps?: boolean;
thoughtPhases?: ThoughtPhase[];
onSelectFollowUp?: (text: string) => void;
```

At the bottom of the `AssistantMessage` return, after `MessageActions`:
```tsx
import { generateFollowUps } from "@/lib/utils/follow-ups";

{showFollowUps && thoughtPhases && onSelectFollowUp && (
  <div className="mt-3 flex flex-wrap gap-2">
    {generateFollowUps(thoughtPhases).map((suggestion) => (
      <button
        key={suggestion}
        onClick={() => onSelectFollowUp(suggestion)}
        className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        {suggestion}
      </button>
    ))}
  </div>
)}
```

Extract `thoughtPhases` from the `thoughts` already computed in `AssistantMessage`:
```ts
const thoughtPhases = thoughts.map((t) => t.phase);
```

- [ ] **Step 3: Wire through MessageList**

Add to `MessageListProps`:
```ts
onSelectFollowUp: (text: string) => void;
```

Pass to last assistant message:
```tsx
<AssistantMessage
  parts={message.parts as UIPart[]}
  isStreaming={isMessageStreaming}
  onRegenerate={isLastMessage ? onRegenerate : undefined}
  showFollowUps={isLastMessage && !isStreaming}
  onSelectFollowUp={onSelectFollowUp}
/>
```

- [ ] **Step 4: Wire through interface.tsx**

In `interface.tsx`:
1. Destructure `handleSelectSuggestion` (already exists — reuse it for follow-ups, it sets the prompt)
2. Pass `onSelectFollowUp={handleSelectSuggestion}` to `MessageList`

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add lib/utils/follow-ups.ts \
  components/chat-interface/components/assistant-message.tsx \
  components/chat-interface/components/message-list.tsx \
  components/chat-interface/interface.tsx
git commit -m "feat: show contextual follow-up suggestion chips after AI reply"
```

---

## Task 6: Keyboard Shortcut — New Chat

**Files:**
- Modify: `components/chat-interface/interface.tsx`

`⌘K` (Mac) / `Ctrl+K` (Windows) navigates to `/chat` to start a new conversation.

- [ ] **Step 1: Add keyboard shortcut hook in interface.tsx**

```tsx
import { useEffect } from "react";

// Inside Interface component, add:
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    const modifier = isMac ? e.metaKey : e.ctrlKey;
    if (modifier && e.key === "k") {
      e.preventDefault();
      router.push("/chat");
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [router]);
```

Import `useRouter` (already in the hook, but `interface.tsx` needs its own if it doesn't have one — check first, use `useRouter` from `next/navigation`).

- [ ] **Step 2: Add keyboard hint to the sidebar New Chat button or input placeholder**

In `components/chat-interface/sidebar.tsx`, find the "New Chat" button and add a `⌘K` badge:
```tsx
<span className="text-xs text-muted-foreground opacity-60">⌘K</span>
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add components/chat-interface/interface.tsx components/chat-interface/sidebar.tsx
git commit -m "feat: add ⌘K keyboard shortcut for new chat"
```

---

## Final Check

- [ ] Run full type-check: `npx tsc --noEmit`
- [ ] Test each feature manually:
  - Trip dialog: open, search countries, pick airline, toggle language, pick cabin, save
  - Regenerate: send a message, click regenerate on the last AI reply
  - Export: send messages, click download, verify `.txt` file content
  - Follow-ups: send a message, verify 3 chips appear after streaming, click one, verify input is populated
  - ⌘K: press shortcut, verify navigation to `/chat`
