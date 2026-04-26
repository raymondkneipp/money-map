/**
 * Integration: project a full graph forward in time and verify that
 * balances move the way an honest spreadsheet would predict. Exercises
 * node-projection.ts together with allocation.ts and the node types.
 */

import type { Edge, Node } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import { projectNodeSeries } from "#/lib/node-projection";

const at = (x = 0, y = 0) => ({ x, y });

describe("checking projection — net cash flow drives balance", () => {
	it("zero-APY checking: balance grows linearly by (income − expenses)", () => {
		const nodes: Node[] = [
			{
				id: "inc",
				type: "incomeNode",
				position: at(),
				data: { name: "Salary", amount: 5000, frequency: "monthly", passive: false },
			} as never,
			{
				id: "chk",
				type: "checkingNode",
				position: at(),
				data: { name: "Checking", principal: 1000, apy: 0 },
			} as never,
			{
				id: "rent",
				type: "expenseNode",
				position: at(),
				data: { name: "Rent", amount: 1500, frequency: "monthly", category: "housing" },
			} as never,
		];
		const edges: Edge[] = [
			{
				id: "e1",
				source: "inc",
				target: "chk",
				type: "allocation",
				data: { mode: "remainder" },
			} as Edge,
			{ id: "e2", source: "chk", target: "rent", type: "expense" } as Edge,
		];

		const series = projectNodeSeries(nodes[1], nodes, edges, {}, 12);
		expect(series.points[0].value).toBe(1000);
		// Net = 5000 − 1500 = 3500/mo. After 12 months: 1000 + 3500*12 = 43000.
		expect(series.points[12].value).toBe(43_000);
	});

	it("over-allocated outflow is capped at inflow → balance is preserved", () => {
		// Income trickles $100/mo, but rent wants $1,000/mo. The system caps
		// outflow at inflow (you can't pay a bill with money you don't have)
		// so net flow is zero and the starting balance is preserved.
		const nodes: Node[] = [
			{
				id: "inc",
				type: "incomeNode",
				position: at(),
				data: { name: "Trickle", amount: 100, frequency: "monthly", passive: false },
			} as never,
			{
				id: "chk",
				type: "checkingNode",
				position: at(),
				data: { name: "Checking", principal: 500, apy: 0 },
			} as never,
			{
				id: "rent",
				type: "expenseNode",
				position: at(),
				data: { name: "Rent", amount: 1000, frequency: "monthly", category: "housing" },
			} as never,
		];
		const edges: Edge[] = [
			{
				id: "e1",
				source: "inc",
				target: "chk",
				type: "allocation",
				data: { mode: "remainder" },
			} as Edge,
			{ id: "e2", source: "chk", target: "rent", type: "expense" } as Edge,
		];

		const series = projectNodeSeries(nodes[1], nodes, edges, {}, 24);
		// Balance never moves — outflow is clamped to inflow.
		expect(series.points[0].value).toBe(500);
		expect(series.points[24].value).toBe(500);
	});
});

describe("debt projection — amortization", () => {
	it("zero-APR debt with $100/mo min pays off in 10 months from $1k", () => {
		const node: Node = {
			id: "card",
			type: "debtNode",
			position: at(),
			data: {
				name: "Card",
				debtType: "creditCard",
				principal: 1000,
				apr: 0,
				minimumPayment: 100,
				minimumFrequency: "monthly",
			},
		} as never;
		const series = projectNodeSeries(node, [node], [], {}, 12);
		expect(series.points[10].value).toBe(0);
		// And stays at 0.
		expect(series.points[12].value).toBe(0);
	});

	it("interest-bearing debt records cumulative interest in `readout`", () => {
		const node: Node = {
			id: "card",
			type: "debtNode",
			position: at(),
			data: {
				name: "Card",
				debtType: "creditCard",
				principal: 1000,
				apr: 12,
				minimumPayment: 100,
				minimumFrequency: "monthly",
			},
		} as never;
		const series = projectNodeSeries(node, [node], [], {}, 24);
		const last = series.points[series.points.length - 1];
		// Interest paid is non-trivial when APR > 0
		expect(last.readout).toBeGreaterThan(0);
		// And less than what an unrealistic upper bound would imply
		expect(last.readout).toBeLessThan(1000);
	});

	it("wired payment from checking accelerates payoff vs minimum-only", () => {
		const baseDebt: Node = {
			id: "card",
			type: "debtNode",
			position: at(),
			data: {
				name: "Card",
				debtType: "creditCard",
				principal: 5000,
				apr: 0,
				minimumPayment: 100,
				minimumFrequency: "monthly",
			},
		} as never;

		// Scenario A: minimum only
		const aSeries = projectNodeSeries(baseDebt, [baseDebt], [], {}, 60);
		const aPayoff = aSeries.points.findIndex((p) => p.month > 0 && p.value <= 0);

		// Scenario B: $500/mo wired in from checking
		const inc: Node = {
			id: "inc",
			type: "incomeNode",
			position: at(),
			data: { name: "Salary", amount: 5000, frequency: "monthly", passive: false },
		} as never;
		const chk: Node = {
			id: "chk",
			type: "checkingNode",
			position: at(),
			data: { name: "Checking", principal: 0, apy: 0 },
		} as never;
		const bNodes = [inc, chk, baseDebt];
		const bEdges: Edge[] = [
			{
				id: "e1",
				source: "inc",
				target: "chk",
				type: "allocation",
				data: { mode: "remainder" },
			} as Edge,
			{
				id: "e2",
				source: "chk",
				target: "card",
				type: "allocation",
				data: { mode: "fixed", amount: 500, frequency: "monthly" },
			} as Edge,
		];
		const bSeries = projectNodeSeries(baseDebt, bNodes, bEdges, {}, 60);
		const bPayoff = bSeries.points.findIndex((p) => p.month > 0 && p.value <= 0);

		expect(bPayoff).toBeGreaterThan(0);
		expect(bPayoff).toBeLessThan(aPayoff);
		// $500/mo flat on $5k → 10 months
		expect(bPayoff).toBe(10);
	});
});

describe("retirement projection — match + compounding", () => {
	it("contributions are grossed up by employer match", () => {
		const inc: Node = {
			id: "inc",
			type: "incomeNode",
			position: at(),
			data: { name: "Salary", amount: 5000, frequency: "monthly", passive: false },
		} as never;
		// Employer match = 100% means each contributed dollar becomes two.
		const ret: Node = {
			id: "ret",
			type: "retirementNode",
			position: at(),
			data: { name: "401k", principal: 0, apy: 0, employerMatch: 100 },
		} as never;
		const edges: Edge[] = [
			{
				id: "e",
				source: "inc",
				target: "ret",
				type: "allocation",
				data: { mode: "fixed", amount: 500, frequency: "monthly" },
			} as Edge,
		];
		const series = projectNodeSeries(ret, [inc, ret], edges, {}, 12);
		// $500/mo contributions × 2 (match) × 12 months = 12,000 with 0% return.
		expect(series.points[12].value).toBeCloseTo(12_000);
	});

	it("compounding only — no contribution — grows at the stated APY", () => {
		const ret: Node = {
			id: "ret",
			type: "retirementNode",
			position: at(),
			data: { name: "401k", principal: 10_000, apy: 12, employerMatch: 0 },
		} as never;
		const series = projectNodeSeries(ret, [ret], [], {}, 12);
		// 12% APY discretized monthly = (1 + 0.12/12)^12 = ~1.1268
		expect(series.points[12].value).toBeCloseTo(10_000 * (1 + 0.12 / 12) ** 12, 0);
	});
});

describe("crypto projection — true monthly equivalent rate", () => {
	it("compounds 12 months → exactly the profile's APY", () => {
		const node: Node = {
			id: "btc",
			type: "cryptoNode",
			position: at(),
			data: {
				name: "Bitcoin",
				coin: "bitcoin",
				principal: 1, // 1 coin
				growthProfile: "moderate", // 15% APY
			},
		} as never;
		const prices = { bitcoin: 100 };
		const series = projectNodeSeries(node, [node], [], prices, 12);
		expect(series.points[0].value).toBe(100);
		// 12 monthly compounds of (1.15)^(1/12) → exactly 1.15× start.
		expect(series.points[12].value).toBeCloseTo(115, 5);
	});
});

describe("income / expense projections — cumulative running totals", () => {
	it("income series is a straight ramp at monthly value", () => {
		const inc: Node = {
			id: "inc",
			type: "incomeNode",
			position: at(),
			data: { name: "Salary", amount: 5000, frequency: "monthly", passive: false },
		} as never;
		const series = projectNodeSeries(inc, [inc], [], {}, 12);
		expect(series.stepped).toBe(true);
		expect(series.points[0].value).toBe(0);
		expect(series.points[12].value).toBe(60_000);
	});

	it("expense series accumulates the same way", () => {
		const exp: Node = {
			id: "rent",
			type: "expenseNode",
			position: at(),
			data: { name: "Rent", amount: 1500, frequency: "monthly", category: "housing" },
		} as never;
		const series = projectNodeSeries(exp, [exp], [], {}, 12);
		expect(series.points[12].value).toBe(18_000);
	});
});
