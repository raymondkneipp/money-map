/**
 * Integration: build a realistic monthly budget out of nodes + edges, then
 * verify that the inflow/outflow/utilization math agrees with what a human
 * would expect. Exercises allocation.ts end-to-end across an entire graph.
 */

import type { Edge, Node } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import {
	computeNodeUtilization,
	edgeAnnualValue,
	edgeStrokeWidth,
	nodeAnnualInflow,
	nodeAnnualOutflow,
} from "#/lib/allocation";
import {
	buildEdgeForConnection,
	isValidConnection,
} from "#/lib/edge-rules";

// ──────────────────────────────────────────────────────────────────────────
// Builders
// ──────────────────────────────────────────────────────────────────────────

const at = (x = 0, y = 0) => ({ x, y });

const income = (id: string, monthly: number): Node =>
	({
		id,
		type: "incomeNode",
		position: at(),
		data: {
			name: id,
			amount: monthly,
			frequency: "monthly",
			passive: false,
		},
	}) as never;

const checking = (id: string, principal = 0, apy = 0): Node =>
	({
		id,
		type: "checkingNode",
		position: at(),
		data: { name: id, principal, apy },
	}) as never;

const savings = (id: string, principal = 0, apy = 0): Node =>
	({
		id,
		type: "savingsNode",
		position: at(),
		data: { name: id, principal, apy },
	}) as never;

const emergency = (id: string, principal = 0, apy = 0): Node =>
	({
		id,
		type: "emergencyFundNode",
		position: at(),
		data: { name: id, principal, apy, targetMonths: 6 },
	}) as never;

const expense = (id: string, monthly: number): Node =>
	({
		id,
		type: "expenseNode",
		position: at(),
		data: {
			name: id,
			amount: monthly,
			frequency: "monthly",
			category: "other",
		},
	}) as never;

const debt = (
	id: string,
	principal: number,
	apr: number,
	minMonthly: number,
): Node =>
	({
		id,
		type: "debtNode",
		position: at(),
		data: {
			name: id,
			debtType: "creditCard",
			principal,
			apr,
			minimumPayment: minMonthly,
			minimumFrequency: "monthly",
		},
	}) as never;

const retirement = (id: string, employerMatch = 0): Node =>
	({
		id,
		type: "retirementNode",
		position: at(),
		data: { name: id, principal: 0, apy: 7, employerMatch },
	}) as never;

const allocFixed = (
	id: string,
	source: string,
	target: string,
	monthly: number,
): Edge =>
	({
		id,
		source,
		target,
		type: "allocation",
		data: { mode: "fixed", amount: monthly, frequency: "monthly" },
	}) as Edge;

const allocPercent = (
	id: string,
	source: string,
	target: string,
	percent: number,
): Edge =>
	({
		id,
		source,
		target,
		type: "allocation",
		data: { mode: "percent", percent },
	}) as Edge;

const allocRemainder = (id: string, source: string, target: string): Edge =>
	({
		id,
		source,
		target,
		type: "allocation",
		data: { mode: "remainder" },
	}) as Edge;

const expenseEdge = (id: string, source: string, target: string): Edge =>
	({ id, source, target, type: "expense" }) as Edge;

// ──────────────────────────────────────────────────────────────────────────
// A typical post-tax budget, modeled as a graph
//
//   income (5,000/mo)
//     ├─ 10% percent ──► retirement (50% employer match)
//     └─ remainder ──► checking
//         ├─ expense ─► rent ($1,500)
//         ├─ expense ─► groceries ($500)
//         ├─ fixed $200 ─► savings
//         ├─ fixed $200 ─► card debt
//         └─ remainder ──► emergency
// ──────────────────────────────────────────────────────────────────────────

function buildBudget() {
	const nodes: Node[] = [
		income("inc", 5000),
		retirement("ret", 50),
		checking("chk"),
		expense("rent", 1500),
		expense("food", 500),
		savings("sav"),
		debt("card", 5000, 24, 100),
		emergency("em"),
	];
	const edges: Edge[] = [
		allocPercent("inc-ret", "inc", "ret", 10),
		allocRemainder("inc-chk", "inc", "chk"),
		expenseEdge("chk-rent", "chk", "rent"),
		expenseEdge("chk-food", "chk", "food"),
		allocFixed("chk-sav", "chk", "sav", 200),
		allocFixed("chk-card", "chk", "card", 200),
		allocRemainder("chk-em", "chk", "em"),
	];
	return { nodes, edges };
}

describe("realistic budget — node inflows", () => {
	const { nodes, edges } = buildBudget();

	it("income node carries its own annualized amount", () => {
		expect(nodeAnnualInflow("inc", nodes, edges)).toBe(60_000);
	});

	it("retirement contribution is 10% of income, grossed up by 50% match", () => {
		// 10% of 60k = 6,000 → * 1.5 = 9,000
		expect(nodeAnnualInflow("ret", nodes, edges)).toBe(9_000);
	});

	it("checking gets the remainder after the 10% retirement allocation", () => {
		expect(nodeAnnualInflow("chk", nodes, edges)).toBe(54_000);
	});

	it("expense nodes pull their own annualized cost regardless of source", () => {
		expect(nodeAnnualInflow("rent", nodes, edges)).toBe(18_000);
		expect(nodeAnnualInflow("food", nodes, edges)).toBe(6_000);
	});

	it("savings + debt receive their fixed monthly amounts", () => {
		expect(nodeAnnualInflow("sav", nodes, edges)).toBe(2_400);
		expect(nodeAnnualInflow("card", nodes, edges)).toBe(2_400);
	});

	it("emergency fund absorbs whatever is left after fixed/expense siblings", () => {
		// chk inflow 54k − rent 18k − food 6k − sav 2.4k − card 2.4k = 25.2k
		expect(nodeAnnualInflow("em", nodes, edges)).toBeCloseTo(25_200);
	});
});

describe("realistic budget — flow conservation", () => {
	const { nodes, edges } = buildBudget();

	it("checking outflow equals checking inflow (fully allocated)", () => {
		const inflow = nodeAnnualInflow("chk", nodes, edges);
		const outflow = nodeAnnualOutflow("chk", nodes, edges);
		expect(outflow).toBeCloseTo(inflow);
	});

	it("income outflow is fully allocated across retirement + checking", () => {
		const inflow = nodeAnnualInflow("inc", nodes, edges);
		const outflow = nodeAnnualOutflow("inc", nodes, edges);
		expect(outflow).toBeCloseTo(inflow);
	});

	it("sum of terminal-node inflows equals income (excluding employer match)", () => {
		// Terminals: rent, food, sav, card, em, ret-contribution.
		// Retirement raw contribution (before match) is 6,000.
		const terminals =
			nodeAnnualInflow("rent", nodes, edges) +
			nodeAnnualInflow("food", nodes, edges) +
			nodeAnnualInflow("sav", nodes, edges) +
			nodeAnnualInflow("card", nodes, edges) +
			nodeAnnualInflow("em", nodes, edges) +
			6_000; // raw contribution into retirement
		expect(terminals).toBeCloseTo(60_000);
	});
});

describe("realistic budget — utilization", () => {
	const { nodes, edges } = buildBudget();

	it("checking is fully utilized (remainder edge consumes leftover)", () => {
		const u = computeNodeUtilization("chk", nodes, edges);
		expect(u.over).toBe(false);
		expect(u.unallocatedAnnual).toBe(0);
		expect(u.allocatedAnnual).toBeCloseTo(u.totalAnnual);
	});

	it("flips `over` once expenses+fixed exceed inflow", () => {
		const tooMuchRent = buildBudget();
		const rent = tooMuchRent.nodes.find((n) => n.id === "rent")!;
		(rent.data as { amount: number }).amount = 99_999;
		const u = computeNodeUtilization("chk", tooMuchRent.nodes, tooMuchRent.edges);
		expect(u.over).toBe(true);
	});
});

describe("realistic budget — edge values match the wiring", () => {
	const { nodes, edges } = buildBudget();

	it("the percent edge to retirement carries 10% of income", () => {
		const e = edges.find((x) => x.id === "inc-ret")!;
		expect(edgeAnnualValue(e, nodes, edges)).toBe(6_000);
	});

	it("the remainder edge to checking carries everything else", () => {
		const e = edges.find((x) => x.id === "inc-chk")!;
		expect(edgeAnnualValue(e, nodes, edges)).toBe(54_000);
	});

	it("fixed edges carry exactly their stated amount", () => {
		const sav = edges.find((x) => x.id === "chk-sav")!;
		expect(edgeAnnualValue(sav, nodes, edges)).toBe(2_400);
	});

	it("expense edges carry the target's cost", () => {
		const rent = edges.find((x) => x.id === "chk-rent")!;
		expect(edgeAnnualValue(rent, nodes, edges)).toBe(18_000);
	});

	it("stroke widths rank edges by value (largest = MAX, others < MAX)", () => {
		const widths = edges.map((e) => ({
			id: e.id,
			w: edgeStrokeWidth(e, nodes, edges),
			v: edgeAnnualValue(e, nodes, edges),
		}));
		const max = widths.reduce((a, b) => (a.v > b.v ? a : b));
		// inc-chk has the largest annual value (54k); should hit MAX = 6
		expect(max.id).toBe("inc-chk");
		expect(max.w).toBeCloseTo(6);
		for (const w of widths) {
			expect(w.w).toBeGreaterThanOrEqual(1);
			expect(w.w).toBeLessThanOrEqual(6);
		}
	});
});

describe("graph rules + builder agree with the budget shape", () => {
	const { nodes, edges } = buildBudget();

	it("every wired edge in the budget passes isValidConnection on an empty graph", () => {
		// Replay the wiring against an empty edge list — each connection on its
		// own must be admissible.
		for (const e of edges) {
			const ok = isValidConnection(
				{ source: e.source, target: e.target, sourceHandle: null, targetHandle: null },
				nodes,
				[],
			);
			expect(ok).toBe(true);
		}
	});

	it("would reject a 2nd edge into rent (single-source expense rule)", () => {
		expect(
			isValidConnection(
				{ source: "inc", target: "rent", sourceHandle: null, targetHandle: null },
				nodes,
				edges,
			),
		).toBe(false);
	});

	it("would reject savings → savings (savings only accepts income/checking)", () => {
		const extra = [...nodes, savings("s2")];
		expect(
			isValidConnection(
				{ source: "sav", target: "s2", sourceHandle: null, targetHandle: null },
				extra,
				edges,
			),
		).toBe(false);
	});

	it("would build an `expense` edge for chk → a fresh expense", () => {
		const extra = [...nodes, expense("phone", 50)];
		const built = buildEdgeForConnection(
			{ source: "chk", target: "phone", sourceHandle: null, targetHandle: null },
			extra,
		);
		expect(built.type).toBe("expense");
	});

	it("would build a remainder allocation for chk → savings clone", () => {
		const extra = [...nodes, savings("sav2")];
		const built = buildEdgeForConnection(
			{ source: "chk", target: "sav2", sourceHandle: null, targetHandle: null },
			extra,
		);
		expect(built.type).toBe("allocation");
		expect((built as Edge<{ mode: string }>).data?.mode).toBe("remainder");
	});
});
