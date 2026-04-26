import type { Edge, Node } from "@xyflow/react";
import {
	nodeAnnualInflow,
	nodeAnnualOutflow,
} from "#/components/flow/allocation";
import {
	type AssetNodeData,
	type CheckingNodeData,
	type CryptoCoinId,
	CRYPTO_COINS,
	type CryptoNodeData,
	type DebtNodeData,
	type DebtType,
	DEBT_TYPES,
	type EmergencyFundNodeData,
	type ExpenseCategory,
	EXPENSE_CATEGORIES,
	type ExpenseNodeData,
	type IncomeNodeData,
	type RetirementNodeData,
	type SavingsNodeData,
	toAnnual,
} from "#/components/flow/types";

const CRYPTO_COIN_META = Object.fromEntries(
	CRYPTO_COINS.map((c) => [c.id, c]),
) as Record<CryptoCoinId, (typeof CRYPTO_COINS)[number]>;

const EXPENSE_CATEGORY_LABEL = Object.fromEntries(
	EXPENSE_CATEGORIES.map((c) => [c.id, c.label]),
) as Record<ExpenseCategory, string>;

const DEBT_TYPE_LABEL = Object.fromEntries(
	DEBT_TYPES.map((d) => [d.id, d.label]),
) as Record<DebtType, string>;

export type AssetBucket =
	| "cash"
	| "liquid"
	| "retirement"
	| "taxable"
	| "crypto";

export const ASSET_BUCKET_LABEL: Record<AssetBucket, string> = {
	cash: "Cash",
	liquid: "Liquid savings",
	retirement: "Retirement",
	taxable: "Taxable",
	crypto: "Crypto",
};

/** Total monthly gross income across all income nodes. */
export function monthlyIncome(nodes: Node[]): number {
	let annual = 0;
	for (const n of nodes) {
		if (n.type !== "incomeNode") continue;
		const d = (n as IncomeNodeData).data;
		annual += toAnnual(d.amount, d.frequency);
	}
	return annual / 12;
}

/** Total monthly expenses across all expense nodes. */
export function monthlyExpenses(nodes: Node[]): number {
	let annual = 0;
	for (const n of nodes) {
		if (n.type !== "expenseNode") continue;
		const d = (n as ExpenseNodeData).data;
		annual += toAnnual(d.amount, d.frequency);
	}
	return annual / 12;
}

/** Total monthly debt minimum payments across all debt nodes. */
export function monthlyDebtMinimums(nodes: Node[]): number {
	let annual = 0;
	for (const n of nodes) {
		if (n.type !== "debtNode") continue;
		const d = (n as DebtNodeData).data;
		annual += toAnnual(d.minimumPayment, d.minimumFrequency);
	}
	return annual / 12;
}

/** Sum of expense subtotals, grouped by category. */
export function expensesByCategory(
	nodes: Node[],
): Array<{ category: ExpenseCategory; label: string; monthly: number }> {
	const totals = new Map<ExpenseCategory, number>();
	for (const n of nodes) {
		if (n.type !== "expenseNode") continue;
		const d = (n as ExpenseNodeData).data;
		const m = toAnnual(d.amount, d.frequency) / 12;
		totals.set(d.category, (totals.get(d.category) ?? 0) + m);
	}
	return [...totals.entries()]
		.map(([category, monthly]) => ({
			category,
			label: EXPENSE_CATEGORY_LABEL[category],
			monthly,
		}))
		.sort((a, b) => b.monthly - a.monthly);
}

/** Total outstanding balance per debt type. */
export function debtsByType(
	nodes: Node[],
): Array<{ type: DebtType; label: string; principal: number }> {
	const totals = new Map<DebtType, number>();
	for (const n of nodes) {
		if (n.type !== "debtNode") continue;
		const d = (n as DebtNodeData).data;
		totals.set(d.debtType, (totals.get(d.debtType) ?? 0) + d.principal);
	}
	return [...totals.entries()]
		.map(([type, principal]) => ({
			type,
			label: DEBT_TYPE_LABEL[type],
			principal,
		}))
		.sort((a, b) => b.principal - a.principal);
}

/** Asset balances bucketed for the allocation breakdown. */
export function assetAllocation(
	nodes: Node[],
	cryptoPrices: Partial<Record<CryptoCoinId, number>> = {},
): Array<{ bucket: AssetBucket; label: string; value: number }> {
	const totals: Record<AssetBucket, number> = {
		cash: 0,
		liquid: 0,
		retirement: 0,
		taxable: 0,
		crypto: 0,
	};
	for (const n of nodes) {
		if (n.type === "checkingNode") {
			totals.cash += (n as CheckingNodeData).data.principal;
		} else if (n.type === "savingsNode") {
			totals.liquid += (n as SavingsNodeData).data.principal;
		} else if (n.type === "emergencyFundNode") {
			totals.liquid += (n as EmergencyFundNodeData).data.principal;
		} else if (n.type === "retirementNode") {
			totals.retirement += (n as RetirementNodeData).data.principal;
		} else if (n.type === "assetNode") {
			const d = (n as AssetNodeData).data;
			if (d.assetType === "ira") totals.retirement += d.principal;
			else totals.taxable += d.principal;
		} else if (n.type === "cryptoNode") {
			const d = (n as CryptoNodeData).data;
			const price = cryptoPrices[d.coin] ?? 0;
			totals.crypto += d.principal * price;
		}
	}
	return (Object.keys(totals) as AssetBucket[])
		.map((bucket) => ({
			bucket,
			label: ASSET_BUCKET_LABEL[bucket],
			value: totals[bucket],
		}))
		.filter((b) => b.value > 0);
}

/** Total assets at current value (sum of buckets). */
export function totalAssets(
	nodes: Node[],
	cryptoPrices: Partial<Record<CryptoCoinId, number>> = {},
): number {
	return assetAllocation(nodes, cryptoPrices).reduce(
		(s, b) => s + b.value,
		0,
	);
}

/** Total outstanding debt principal across all debt nodes. */
export function totalDebt(nodes: Node[]): number {
	let sum = 0;
	for (const n of nodes) {
		if (n.type !== "debtNode") continue;
		sum += (n as DebtNodeData).data.principal;
	}
	return sum;
}

/** Net worth: assets minus debts. */
export function netWorth(
	nodes: Node[],
	cryptoPrices: Partial<Record<CryptoCoinId, number>> = {},
): number {
	return totalAssets(nodes, cryptoPrices) - totalDebt(nodes);
}

/**
 * Monthly net cash flow: gross income minus all recurring outflows
 * (expenses, debt minimums). Investments / savings contributions are
 * treated as voluntary, so they're not subtracted here — this number
 * represents what's available *before* allocation.
 */
export function monthlyCashFlow(nodes: Node[]): number {
	return (
		monthlyIncome(nodes) -
		monthlyExpenses(nodes) -
		monthlyDebtMinimums(nodes)
	);
}

/**
 * Debt-to-income ratio as a percent (0-100+). Standard front-end DTI
 * uses gross monthly income against monthly debt obligations.
 */
export function debtToIncome(nodes: Node[]): number {
	const income = monthlyIncome(nodes);
	if (income <= 0) return 0;
	return (monthlyDebtMinimums(nodes) / income) * 100;
}

export type MonthlyBreakdownSlice = {
	id: string;
	label: string;
	monthly: number;
};

/**
 * Where each monthly dollar of income goes: each expense category, then
 * aggregated investment / savings / debt-payoff buckets, then leftover.
 */
export function monthlyBreakdown(
	nodes: Node[],
	edges: Edge[],
): MonthlyBreakdownSlice[] {
	const slices: MonthlyBreakdownSlice[] = [];
	const income = monthlyIncome(nodes);

	for (const cat of expensesByCategory(nodes)) {
		slices.push({
			id: `expense-${cat.category}`,
			label: cat.label,
			monthly: cat.monthly,
		});
	}

	let retirementContrib = 0;
	let savingsContrib = 0;
	let taxableContrib = 0;
	let debtPayoff = 0;
	for (const n of nodes) {
		const monthly = nodeAnnualInflow(n.id, nodes, edges) / 12;
		if (monthly <= 0) continue;
		if (n.type === "retirementNode") {
			// strip out employer match — we want employee out-of-pocket
			const match = (n as RetirementNodeData).data.employerMatch / 100;
			retirementContrib += monthly / (1 + match);
		} else if (n.type === "savingsNode" || n.type === "emergencyFundNode") {
			savingsContrib += monthly;
		} else if (n.type === "assetNode") {
			const d = (n as AssetNodeData).data;
			if (d.assetType === "ira") retirementContrib += monthly;
			else taxableContrib += monthly;
		} else if (n.type === "debtNode") {
			debtPayoff += monthly;
		}
	}

	if (retirementContrib > 0)
		slices.push({
			id: "retirement",
			label: "Retirement",
			monthly: retirementContrib,
		});
	if (taxableContrib > 0)
		slices.push({
			id: "taxable",
			label: "Investments",
			monthly: taxableContrib,
		});
	if (savingsContrib > 0)
		slices.push({ id: "savings", label: "Savings", monthly: savingsContrib });
	if (debtPayoff > 0)
		slices.push({
			id: "debt-payoff",
			label: "Debt payoff",
			monthly: debtPayoff,
		});

	const allocated = slices.reduce((s, x) => s + x.monthly, 0);
	const leftover = Math.max(0, income - allocated);
	if (leftover > 0.5) {
		slices.push({ id: "leftover", label: "Unallocated", monthly: leftover });
	}

	return slices.filter((s) => s.monthly > 0);
}

export type CryptoHolding = {
	coin: CryptoCoinId;
	symbol: string;
	name: string;
	units: number;
	price: number;
	value: number;
};

/**
 * Total holdings per coin, aggregating any crypto nodes that share the same
 * coin id. Sorted by USD value descending. `price` and `value` are 0 when no
 * price has been fetched yet for that coin.
 */
export function cryptoHoldings(
	nodes: Node[],
	cryptoPrices: Partial<Record<CryptoCoinId, number>> = {},
): CryptoHolding[] {
	const units = new Map<CryptoCoinId, number>();
	for (const n of nodes) {
		if (n.type !== "cryptoNode") continue;
		const d = (n as CryptoNodeData).data;
		units.set(d.coin, (units.get(d.coin) ?? 0) + d.principal);
	}
	return [...units.entries()]
		.map(([coin, u]) => {
			const meta = CRYPTO_COIN_META[coin];
			const price = cryptoPrices[coin] ?? 0;
			return {
				coin,
				symbol: meta.symbol,
				name: meta.name,
				units: u,
				price,
				value: u * price,
			};
		})
		.sort((a, b) => b.value - a.value);
}

/** Distinct crypto coin IDs present in the graph. */
export function uniqueCryptoCoins(nodes: Node[]): CryptoCoinId[] {
	const set = new Set<CryptoCoinId>();
	for (const n of nodes) {
		if (n.type !== "cryptoNode") continue;
		set.add((n as CryptoNodeData).data.coin);
	}
	return [...set];
}

/** Fraction (0-1) of an income node that is currently allocated. */
export function incomeAllocationFraction(
	incomeId: string,
	nodes: Node[],
	edges: Edge[],
): number {
	const incoming = nodeAnnualInflow(incomeId, nodes, edges);
	if (incoming <= 0) return 0;
	return Math.min(1, nodeAnnualOutflow(incomeId, nodes, edges) / incoming);
}
