import type { Node } from "@xyflow/react";

export const FREQUENCIES = [
	{ id: "daily", label: "Daily", abbr: "d", perYear: 365 },
	{ id: "weekly", label: "Weekly", abbr: "w", perYear: 52 },
	{ id: "biweekly", label: "Biweekly", abbr: "bw", perYear: 26 },
	{ id: "semimonthly", label: "Semi-monthly", abbr: "sm", perYear: 24 },
	{ id: "monthly", label: "Monthly", abbr: "mo", perYear: 12 },
	{ id: "quarterly", label: "Quarterly", abbr: "q", perYear: 4 },
	{ id: "semiannually", label: "Semi-annually", abbr: "sa", perYear: 2 },
	{ id: "annually", label: "Annually", abbr: "y", perYear: 1 },
] as const;

export type FrequencyRecord = (typeof FREQUENCIES)[number];
export type Frequency = FrequencyRecord["id"];

export const FREQUENCY_BY_ID = Object.fromEntries(
	FREQUENCIES.map((f) => [f.id, f]),
) as Record<Frequency, FrequencyRecord>;

export type IncomeNodeData = Node<{
	name: string;
	amount: number;
	frequency: Frequency;
	passive: boolean;
}>;
