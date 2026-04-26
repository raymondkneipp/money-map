import type { Edge, Node } from "@xyflow/react";
import {
	type AssetNodeData,
	type CheckingNodeData,
	CRYPTO_GROWTH_PROFILES,
	type CryptoCoinId,
	type CryptoNodeData,
	type DebtNodeData,
	type EmergencyFundNodeData,
	type RetirementNodeData,
	type SavingsNodeData,
	toAnnual,
} from "#/components/flow/types";
import { nodeAnnualInflow } from "./allocation";
import { ageInYears } from "./dates";
import { monthlyExpenses } from "./stats";

export type ProjectionAssumptions = {
	/** ISO date string (yyyy-mm-dd) for the user's birth date. */
	birthDate: string;
	/** Target retirement age in years. */
	retirementAge: number;
	/** Annual inflation rate as a percent (3 = 3%). */
	inflationPct: number;
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
	/**
	 * Asset-weighted nominal growth rate implied by per-node assumptions
	 * (apy on cash/savings/retirement/asset nodes, growth profile on crypto).
	 * Useful as a read-out, even though the projection itself simulates
	 * each node individually.
	 */
	blendedReturnPct: number;
	/** Total annual contributions flowing into invested assets (today's $). */
	totalAnnualContribution: number;
};

/** Default assumptions used until the user has a real birthdate on file. */
export const DEFAULT_ASSUMPTIONS: ProjectionAssumptions = {
	birthDate: "2000-01-01",
	retirementAge: 67,
	inflationPct: 3,
	safeWithdrawalPct: 4,
};

const CRYPTO_GROWTH_BY_ID = Object.fromEntries(
	CRYPTO_GROWTH_PROFILES.map((p) => [p.id, p.apy]),
) as Record<(typeof CRYPTO_GROWTH_PROFILES)[number]["id"], number>;

type AssetTrack = {
	balance: number;
	growthRate: number;
	annualContribution: number;
};

type DebtTrack = {
	balance: number;
	annualPayoff: number;
	apr: number;
};

function buildTracks(
	nodes: Node[],
	edges: Edge[],
	cryptoPrices: Partial<Record<CryptoCoinId, number>>,
): { assets: AssetTrack[]; debts: DebtTrack[] } {
	const assets: AssetTrack[] = [];
	const debts: DebtTrack[] = [];
	for (const n of nodes) {
		const inflow = nodeAnnualInflow(n.id, nodes, edges);
		if (n.type === "checkingNode") {
			const d = (n as CheckingNodeData).data;
			assets.push({
				balance: d.principal,
				growthRate: d.apy / 100,
				annualContribution: inflow,
			});
		} else if (n.type === "savingsNode") {
			const d = (n as SavingsNodeData).data;
			assets.push({
				balance: d.principal,
				growthRate: d.apy / 100,
				annualContribution: inflow,
			});
		} else if (n.type === "emergencyFundNode") {
			const d = (n as EmergencyFundNodeData).data;
			assets.push({
				balance: d.principal,
				growthRate: d.apy / 100,
				annualContribution: inflow,
			});
		} else if (n.type === "retirementNode") {
			const d = (n as RetirementNodeData).data;
			assets.push({
				balance: d.principal,
				growthRate: d.apy / 100,
				annualContribution: inflow,
			});
		} else if (n.type === "assetNode") {
			const d = (n as AssetNodeData).data;
			assets.push({
				balance: d.principal,
				growthRate: d.apy / 100,
				annualContribution: inflow,
			});
		} else if (n.type === "cryptoNode") {
			const d = (n as CryptoNodeData).data;
			const price = cryptoPrices[d.coin] ?? 0;
			const apy = CRYPTO_GROWTH_BY_ID[d.growthProfile] ?? 0;
			assets.push({
				balance: d.principal * price,
				growthRate: apy / 100,
				annualContribution: inflow,
			});
		} else if (n.type === "debtNode") {
			const d = (n as DebtNodeData).data;
			const annualMin = toAnnual(d.minimumPayment, d.minimumFrequency);
			// Statement minimum is the floor; if the flow wires extra payoff
			// edges in, use the larger of the two.
			debts.push({
				balance: d.principal,
				annualPayoff: Math.max(annualMin, inflow),
				apr: d.apr / 100,
			});
		}
	}
	return { assets, debts };
}

/**
 * Run a deterministic year-by-year projection of net worth. Each invested
 * node grows at its own configured rate (APY for cash/savings/retirement/
 * brokerage, growth profile for crypto). Contributions and debt payments
 * are held constant in real terms (i.e. they grow with inflation).
 *
 * Horizon runs through age 95.
 */
export function runProjection(
	nodes: Node[],
	edges: Edge[],
	a: ProjectionAssumptions,
	cryptoPrices: Partial<Record<CryptoCoinId, number>> = {},
): ProjectionResult {
	const currentAge = ageInYears(a.birthDate);
	const yearsToRetirement = Math.max(0, a.retirementAge - currentAge);
	const currentMonthlyExpenses = monthlyExpenses(nodes);
	const currentAnnualExpenses = currentMonthlyExpenses * 12;

	const i = a.inflationPct / 100;
	const swr = a.safeWithdrawalPct / 100;
	const fiNumber = swr > 0 ? currentAnnualExpenses / swr : 0;

	const { assets, debts } = buildTracks(nodes, edges, cryptoPrices);

	const startingAssets = assets.reduce((s, t) => s + t.balance, 0);
	const startingDebt = debts.reduce((s, t) => s + t.balance, 0);
	const startingNetWorth = startingAssets - startingDebt;
	const totalAnnualContribution = assets.reduce(
		(s, t) => s + t.annualContribution,
		0,
	);
	const blendedReturnPct =
		startingAssets > 0
			? (assets.reduce((s, t) => s + t.balance * t.growthRate, 0) /
					startingAssets) *
				100
			: 0;

	const horizonAge = Math.max(95, a.retirementAge + 5);
	const horizonYears = Math.max(1, horizonAge - currentAge);

	const series: ProjectionPoint[] = [];
	for (let y = 0; y <= horizonYears; y++) {
		const totalAssets = assets.reduce((s, t) => s + t.balance, 0);
		const totalDebt = debts.reduce((s, t) => s + t.balance, 0);
		const nominal = totalAssets - totalDebt;
		const real = nominal / (1 + i) ** y;
		series.push({
			year: y,
			age: currentAge + y,
			nominal,
			real,
			fiTarget: fiNumber,
		});

		// Step each track forward one year. Contributions inflate so they stay
		// constant in real terms.
		const inflationFactor = (1 + i) ** y;
		for (const t of assets) {
			t.balance =
				t.balance * (1 + t.growthRate) + t.annualContribution * inflationFactor;
		}
		for (const t of debts) {
			const grown = t.balance * (1 + t.apr);
			const paid = grown - t.annualPayoff * inflationFactor;
			t.balance = Math.max(0, paid);
		}
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
		blendedReturnPct,
		totalAnnualContribution,
	};
}
