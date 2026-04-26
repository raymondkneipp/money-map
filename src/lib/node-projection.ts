import type { Edge, Node } from "@xyflow/react";
import {
	type AssetNodeData,
	type CheckingNodeData,
	CRYPTO_GROWTH_PROFILES,
	type CryptoCoinId,
	type CryptoNodeData,
	type DebtNodeData,
	type EmergencyFundNodeData,
	type ExpenseNodeData,
	type IncomeNodeData,
	type RetirementNodeData,
	type SavingsNodeData,
	toAnnual,
} from "#/components/flow/types";
import { nodeAnnualInflow, nodeAnnualOutflow } from "./allocation";

export type NodeSeriesPoint = {
	month: number;
	/** The number plotted on the chart. */
	value: number;
	/** Number shown in the readout strip; falls back to `value` if absent. */
	readout?: number;
};

export type NodeSeries = {
	/** Short label describing what `value` represents. */
	label: string;
	/** True for cumulative running totals (income/expense); false for balances. */
	stepped: boolean;
	points: NodeSeriesPoint[];
};

const EMPTY_SERIES: NodeSeries = { label: "—", stepped: false, points: [] };

const CRYPTO_GROWTH_BY_ID = Object.fromEntries(
	CRYPTO_GROWTH_PROFILES.map((p) => [p.id, p.apy]),
) as Record<(typeof CRYPTO_GROWTH_PROFILES)[number]["id"], number>;

/**
 * Project a single node forward month-by-month for the small preview chart
 * shown above the node editor.
 *
 * - Income / expense: cumulative running total (stepped each month).
 * - Debt: outstanding balance amortising at APR with statement minimum
 *   payments (or wired payoff edges, whichever is larger). The curve is
 *   smooth-ish — interest accrues each month, payment knocks balance down.
 * - Cash / savings / emergency / retirement / brokerage / IRA: balance
 *   compounding at APY, plus monthly contribution from inflow edges.
 * - Crypto: USD balance compounding at the chosen growth profile's APY,
 *   plus any USD inflow.
 */
export function projectNodeSeries(
	node: Node,
	nodes: Node[],
	edges: Edge[],
	cryptoPrices: Partial<Record<CryptoCoinId, number>> = {},
	months = 360,
): NodeSeries {
	const horizon = Math.max(1, months);

	if (node.type === "incomeNode") {
		const d = (node as IncomeNodeData).data;
		const monthly = toAnnual(d.amount, d.frequency) / 12;
		const points: NodeSeriesPoint[] = [];
		for (let m = 0; m <= horizon; m++) {
			points.push({ month: m, value: monthly * m });
		}
		return { label: "Cumulative income", stepped: true, points };
	}

	if (node.type === "expenseNode") {
		const d = (node as ExpenseNodeData).data;
		const monthly = toAnnual(d.amount, d.frequency) / 12;
		const points: NodeSeriesPoint[] = [];
		for (let m = 0; m <= horizon; m++) {
			points.push({ month: m, value: monthly * m });
		}
		return { label: "Cumulative paid", stepped: true, points };
	}

	if (node.type === "debtNode") {
		const d = (node as DebtNodeData).data;
		const monthlyRate = d.apr / 100 / 12;
		const monthlyMin = toAnnual(d.minimumPayment, d.minimumFrequency) / 12;
		const monthlyExtra = nodeAnnualInflow(node.id, nodes, edges) / 12;
		const payment = Math.max(monthlyMin, monthlyExtra);
		const points: NodeSeriesPoint[] = [];
		let balance = d.principal;
		let interestPaid = 0;
		for (let m = 0; m <= horizon; m++) {
			points.push({ month: m, value: balance, readout: interestPaid });
			if (balance <= 0) continue;
			const interest = balance * monthlyRate;
			const owed = balance + interest;
			const actual = Math.min(payment, owed);
			interestPaid += Math.min(interest, actual);
			balance = Math.max(0, owed - actual);
		}
		return { label: "Interest paid", stepped: false, points };
	}

	let balance = 0;
	let monthlyRate = 0;
	if (node.type === "checkingNode") {
		const d = (node as CheckingNodeData).data;
		balance = d.principal;
		monthlyRate = d.apy / 100 / 12;
	} else if (node.type === "savingsNode") {
		const d = (node as SavingsNodeData).data;
		balance = d.principal;
		monthlyRate = d.apy / 100 / 12;
	} else if (node.type === "emergencyFundNode") {
		const d = (node as EmergencyFundNodeData).data;
		balance = d.principal;
		monthlyRate = d.apy / 100 / 12;
	} else if (node.type === "retirementNode") {
		const d = (node as RetirementNodeData).data;
		balance = d.principal;
		monthlyRate = d.apy / 100 / 12;
	} else if (node.type === "assetNode") {
		const d = (node as AssetNodeData).data;
		balance = d.principal;
		monthlyRate = d.apy / 100 / 12;
	} else if (node.type === "cryptoNode") {
		const d = (node as CryptoNodeData).data;
		const price = cryptoPrices[d.coin] ?? 0;
		balance = d.principal * price;
		const apy = (CRYPTO_GROWTH_BY_ID[d.growthProfile] ?? 0) / 100;
		// Convert annual rate to true monthly equivalent so 12 compounds = apy.
		monthlyRate = (1 + apy) ** (1 / 12) - 1;
	} else {
		return EMPTY_SERIES;
	}

	const monthlyInflow = nodeAnnualInflow(node.id, nodes, edges) / 12;
	// Cash-like nodes also lose money to outgoing allocations (bills paid from
	// checking, transfers to savings/retirement, etc). Investment-type nodes
	// rarely have outflows and we don't want to subtract phantom withdrawals.
	const includeOutflow =
		node.type === "checkingNode" ||
		node.type === "savingsNode" ||
		node.type === "emergencyFundNode";
	const monthlyOutflow = includeOutflow
		? nodeAnnualOutflow(node.id, nodes, edges) / 12
		: 0;
	const monthlyNet = monthlyInflow - monthlyOutflow;
	const points: NodeSeriesPoint[] = [];
	for (let m = 0; m <= horizon; m++) {
		points.push({ month: m, value: balance });
		balance = Math.max(0, balance * (1 + monthlyRate) + monthlyNet);
	}
	return { label: "Balance", stepped: false, points };
}
