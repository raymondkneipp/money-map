/**
 * Per-node-type stat tiles shown in the expanded chart dialog. Pure: takes a
 * node + the projected series + supporting context, returns rows ready for
 * rendering. No React, no formatting decisions left for the caller — keeps the
 * dialog component focused on layout.
 */

import type { Edge, Node } from "@xyflow/react";
import {
	type AssetNodeData,
	type CheckingNodeData,
	CRYPTO_COINS,
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
import { nodeAnnualInflow, nodeAnnualOutflow } from "#/lib/allocation";
import { dateForMonthOffset, formatMonthYear } from "#/lib/dates";
import { coinUnits, usd } from "#/lib/format";
import type { NodeSeries } from "#/lib/node-projection";

export type StatItem = { label: string; value: string };

export function buildStats(
	node: Node,
	nodes: Node[],
	edges: Edge[],
	cryptoPrices: Partial<Record<CryptoCoinId, number>>,
	series: NodeSeries,
	today: Date,
): StatItem[] {
	const last = series.points[series.points.length - 1] ?? { value: 0 };
	const headlineValue = usd.format(last.readout ?? last.value);

	if (node.type === "incomeNode") {
		const d = (node as IncomeNodeData).data;
		const annual = toAnnual(d.amount, d.frequency);
		return [
			{ label: "Monthly", value: usd.format(annual / 12) },
			{ label: "Annual", value: usd.format(annual) },
			{ label: series.label, value: headlineValue },
		];
	}

	if (node.type === "expenseNode") {
		const d = (node as ExpenseNodeData).data;
		const annual = toAnnual(d.amount, d.frequency);
		return [
			{ label: "Monthly", value: usd.format(annual / 12) },
			{ label: "Annual", value: usd.format(annual) },
			{ label: series.label, value: headlineValue },
		];
	}

	if (node.type === "debtNode") {
		const d = (node as DebtNodeData).data;
		const monthlyMin = toAnnual(d.minimumPayment, d.minimumFrequency) / 12;
		const monthlyExtra = nodeAnnualInflow(node.id, nodes, edges) / 12;
		const payment = Math.max(monthlyMin, monthlyExtra);
		let payoffMonth: number | null = null;
		for (const p of series.points) {
			if (p.month > 0 && p.value <= 0) {
				payoffMonth = p.month;
				break;
			}
		}
		const payoffStr =
			payoffMonth != null
				? formatMonthYear(dateForMonthOffset(today, payoffMonth))
				: "Beyond horizon";
		return [
			{ label: "Balance", value: usd.format(d.principal) },
			{ label: "Monthly payment", value: usd.format(payment) },
			{ label: "APR", value: `${d.apr}%` },
			{ label: "Payoff", value: payoffStr },
			{ label: series.label, value: headlineValue },
		];
	}

	if (
		node.type === "checkingNode" ||
		node.type === "savingsNode" ||
		node.type === "emergencyFundNode"
	) {
		const d = (
			node as CheckingNodeData | SavingsNodeData | EmergencyFundNodeData
		).data;
		const monthlyIn = nodeAnnualInflow(node.id, nodes, edges) / 12;
		const monthlyOut = nodeAnnualOutflow(node.id, nodes, edges) / 12;
		return [
			{ label: "Today", value: usd.format(d.principal) },
			{ label: "Monthly in", value: usd.format(monthlyIn) },
			{ label: "Monthly out", value: usd.format(monthlyOut) },
			{ label: "APY", value: `${d.apy}%` },
			{ label: "Projected", value: usd.format(last.value) },
		];
	}

	if (node.type === "retirementNode" || node.type === "assetNode") {
		const d = (node as RetirementNodeData | AssetNodeData).data;
		const monthlyContribution = nodeAnnualInflow(node.id, nodes, edges) / 12;
		return [
			{ label: "Today", value: usd.format(d.principal) },
			{ label: "Monthly contribution", value: usd.format(monthlyContribution) },
			{ label: "APY", value: `${d.apy}%` },
			{ label: "Projected", value: usd.format(last.value) },
		];
	}

	if (node.type === "cryptoNode") {
		const d = (node as CryptoNodeData).data;
		const meta = CRYPTO_COINS.find((c) => c.id === d.coin);
		const price = cryptoPrices[d.coin] ?? 0;
		const apy =
			CRYPTO_GROWTH_PROFILES.find((p) => p.id === d.growthProfile)?.apy ?? 0;
		return [
			{
				label: "Holdings",
				value: `${coinUnits.format(d.principal)} ${meta?.symbol ?? ""}`.trim(),
			},
			{ label: "Price", value: usd.format(price) },
			{ label: "Today (USD)", value: usd.format(d.principal * price) },
			{ label: "Growth", value: `${apy}%` },
			{ label: "Projected", value: usd.format(last.value) },
		];
	}

	return [{ label: series.label, value: headlineValue }];
}
