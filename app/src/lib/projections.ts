import type { Edge, Node } from "@xyflow/react";
import { nodeAnnualInflow } from "#/components/flow/allocation";
import type { CryptoCoinId } from "#/components/flow/types";
import { netWorth as computeNetWorth, monthlyExpenses } from "./stats";

export type ProjectionAssumptions = {
	/** ISO date string (yyyy-mm-dd) for the user's birth date. */
	birthDate: string;
	/** Target retirement age in years. */
	retirementAge: number;
	/** Annual inflation rate as a percent (3 = 3%). */
	inflationPct: number;
	/** Nominal annual investment return as a percent. */
	investmentReturnPct: number;
	/** Annual contributions to invested net worth, in today's USD. */
	annualContribution: number;
	/** Safe withdrawal rate as a percent (4 = 4% rule). */
	safeWithdrawalPct: number;
};

export type ProjectionPoint = {
	year: number;
	age: number;
	/** Net worth in nominal USD at that year. */
	nominal: number;
	/** Net worth in today's USD (deflated). */
	real: number;
	/** Real-terms FI target at that year (today's expenses / SWR). */
	fiTarget: number;
};

export type ProjectionResult = {
	currentAge: number;
	yearsToRetirement: number;
	startingNetWorth: number;
	currentMonthlyExpenses: number;
	currentAnnualExpenses: number;
	/** Lump sum needed in today's $ to retire under SWR rule. */
	fiNumber: number;
	/** Series of yearly projections from now through age 95. */
	series: ProjectionPoint[];
	/** Snapshot at the chosen retirement age, or null if already past it. */
	atRetirement: ProjectionPoint | null;
	/** Annual retirement income (today's $) drawing from `atRetirement`. */
	retirementIncomeReal: number;
	/** Annual retirement income (nominal $) at retirement year. */
	retirementIncomeNominal: number;
	/**
	 * Earliest age (after today) when real net worth ≥ FI number, or null
	 * if it never crosses within the projection horizon.
	 */
	earlyRetirementAge: number | null;
};

/** Default assumptions used until the user has a real birthdate on file. */
export const DEFAULT_ASSUMPTIONS: ProjectionAssumptions = {
	birthDate: "2000-01-01",
	retirementAge: 67,
	inflationPct: 3,
	investmentReturnPct: 7,
	annualContribution: 0,
	safeWithdrawalPct: 4,
};

/** Whole years between two dates (positive if `from` ≤ `to`). */
export function ageInYears(birthDate: string, on: Date = new Date()): number {
	const b = new Date(birthDate);
	if (Number.isNaN(b.getTime())) return 0;
	let years = on.getFullYear() - b.getFullYear();
	const beforeBirthday =
		on.getMonth() < b.getMonth() ||
		(on.getMonth() === b.getMonth() && on.getDate() < b.getDate());
	if (beforeBirthday) years -= 1;
	return Math.max(0, years);
}

/**
 * Sum of monthly contributions flowing into invested accounts (retirement,
 * savings, brokerage), annualised. This is the default "annual contribution"
 * assumption seeded into the projection — the user can override it.
 *
 * Retirement contributions are kept gross (employee + employer match) since
 * both grow tax-deferred. Debt principal payoff isn't counted because it
 * reduces liabilities rather than building invested assets.
 */
export function defaultAnnualContribution(
	nodes: Node[],
	edges: Edge[],
): number {
	let monthly = 0;
	for (const n of nodes) {
		const m = nodeAnnualInflow(n.id, nodes, edges) / 12;
		if (m <= 0) continue;
		if (
			n.type === "retirementNode" ||
			n.type === "savingsNode" ||
			n.type === "emergencyFundNode" ||
			n.type === "assetNode"
		) {
			monthly += m;
		}
	}
	return monthly * 12;
}

/**
 * Run a deterministic year-by-year projection of net worth under a constant
 * nominal return and inflation. Contributions are assumed to keep pace with
 * inflation (constant in today's $). Horizon runs through age 95.
 */
export function runProjection(
	nodes: Node[],
	a: ProjectionAssumptions,
	cryptoPrices: Partial<Record<CryptoCoinId, number>> = {},
): ProjectionResult {
	const currentAge = ageInYears(a.birthDate);
	const yearsToRetirement = Math.max(0, a.retirementAge - currentAge);
	const startingNetWorth = computeNetWorth(nodes, cryptoPrices);
	const currentMonthlyExpenses = monthlyExpenses(nodes);
	const currentAnnualExpenses = currentMonthlyExpenses * 12;

	const r = a.investmentReturnPct / 100;
	const i = a.inflationPct / 100;
	const swr = a.safeWithdrawalPct / 100;
	const fiNumber = swr > 0 ? currentAnnualExpenses / swr : 0;

	const horizonAge = Math.max(95, a.retirementAge + 5);
	const horizonYears = Math.max(1, horizonAge - currentAge);

	const series: ProjectionPoint[] = [];
	let nominal = startingNetWorth;
	for (let y = 0; y <= horizonYears; y++) {
		const real = nominal / (1 + i) ** y;
		series.push({
			year: y,
			age: currentAge + y,
			nominal,
			real,
			fiTarget: fiNumber,
		});
		// step to next year: grow, then add contribution (real-terms constant)
		const contribNominal = a.annualContribution * (1 + i) ** y;
		nominal = nominal * (1 + r) + contribNominal;
	}

	const atRetirement = series.find((p) => p.age >= a.retirementAge) ?? null;

	const retirementIncomeReal = atRetirement ? atRetirement.real * swr : 0;
	const retirementIncomeNominal = atRetirement ? atRetirement.nominal * swr : 0;

	let earlyRetirementAge: number | null = null;
	if (fiNumber > 0) {
		for (const p of series) {
			if (p.age <= currentAge) continue;
			if (p.real >= fiNumber) {
				earlyRetirementAge = p.age;
				break;
			}
		}
	}

	return {
		currentAge,
		yearsToRetirement,
		startingNetWorth,
		currentMonthlyExpenses,
		currentAnnualExpenses,
		fiNumber,
		series,
		atRetirement,
		retirementIncomeReal,
		retirementIncomeNominal,
		earlyRetirementAge,
	};
}
