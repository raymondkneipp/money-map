import type { Edge, Node } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import {
	computeNodeUtilization,
	edgeAnnualValue,
	edgeStrokeWidth,
	nodeAnnualInflow,
	nodeAnnualOutflow,
} from "./allocation";

// Compact builders so test setup stays readable.
function income(id: string, monthly: number): Node {
	return {
		id,
		type: "incomeNode",
		position: { x: 0, y: 0 },
		data: { name: id, amount: monthly, frequency: "monthly", passive: false },
	} as never;
}

function checking(id: string): Node {
	return {
		id,
		type: "checkingNode",
		position: { x: 0, y: 0 },
		data: { name: id, principal: 0, apy: 0 },
	} as never;
}

function expense(id: string, monthly: number): Node {
	return {
		id,
		type: "expenseNode",
		position: { x: 0, y: 0 },
		data: {
			name: id,
			amount: monthly,
			frequency: "monthly",
			category: "other",
		},
	} as never;
}

function retirement(id: string, employerMatch = 0): Node {
	return {
		id,
		type: "retirementNode",
		position: { x: 0, y: 0 },
		data: { name: id, principal: 0, apy: 0, employerMatch },
	} as never;
}

function alloc(
	id: string,
	source: string,
	target: string,
	data: Record<string, unknown>,
): Edge {
	return { id, source, target, type: "allocation", data } as Edge;
}

function expenseEdge(id: string, source: string, target: string): Edge {
	return { id, source, target, type: "expense" } as Edge;
}

describe("nodeAnnualInflow", () => {
	it("returns the income node's own annualized amount", () => {
		const nodes = [income("inc", 1000)];
		expect(nodeAnnualInflow("inc", nodes, [])).toBe(12000);
	});

	it("sums incoming allocation edges for non-income nodes", () => {
		const nodes = [income("inc", 1000), checking("chk")];
		const edges = [alloc("e", "inc", "chk", { mode: "remainder" })];
		expect(nodeAnnualInflow("chk", nodes, edges)).toBe(12000);
	});

	it("returns 0 for an unknown node id", () => {
		expect(nodeAnnualInflow("ghost", [], [])).toBe(0);
	});

	it("short-circuits on cycles via visited set", () => {
		const nodes = [checking("a"), checking("b")];
		const edges = [
			alloc("e1", "a", "b", { mode: "remainder" }),
			alloc("e2", "b", "a", { mode: "remainder" }),
		];
		expect(nodeAnnualInflow("a", nodes, edges)).toBe(0);
	});

	it("grosses up retirement inflow by employer match", () => {
		const nodes = [income("inc", 1000), retirement("ret", 50)];
		const edges = [alloc("e", "inc", "ret", { mode: "remainder" })];
		// 12000 contributed * 1.5 employer match factor
		expect(nodeAnnualInflow("ret", nodes, edges)).toBe(18000);
	});
});

describe("edgeAnnualValue", () => {
	it("returns the target's annualized cost for expense edges", () => {
		const nodes = [checking("chk"), expense("rent", 2000)];
		const edges = [expenseEdge("e", "chk", "rent")];
		expect(edgeAnnualValue(edges[0], nodes, edges)).toBe(24000);
	});

	it("computes fixed-mode allocations from amount/frequency", () => {
		const nodes = [income("inc", 5000), checking("chk")];
		const edges = [
			alloc("e", "inc", "chk", {
				mode: "fixed",
				amount: 100,
				frequency: "monthly",
			}),
		];
		expect(edgeAnnualValue(edges[0], nodes, edges)).toBe(1200);
	});

	it("computes percent-mode allocations against the source's inflow", () => {
		const nodes = [income("inc", 1000), checking("chk")];
		const edges = [alloc("e", "inc", "chk", { mode: "percent", percent: 25 })];
		// 25% of 12000
		expect(edgeAnnualValue(edges[0], nodes, edges)).toBe(3000);
	});

	it("splits remainder evenly across all remainder siblings", () => {
		const nodes = [income("inc", 1000), checking("a"), checking("b")];
		const edges = [
			alloc("e1", "inc", "a", { mode: "remainder" }),
			alloc("e2", "inc", "b", { mode: "remainder" }),
		];
		// 12000 / 2 remainders
		expect(edgeAnnualValue(edges[0], nodes, edges)).toBe(6000);
	});

	it("remainder subtracts non-remainder siblings before splitting", () => {
		const nodes = [income("inc", 1000), checking("a"), checking("b")];
		const edges = [
			alloc("e1", "inc", "a", {
				mode: "fixed",
				amount: 200,
				frequency: "monthly",
			}),
			alloc("e2", "inc", "b", { mode: "remainder" }),
		];
		// 12000 - 2400 fixed = 9600 leftover, 1 remainder gets it all
		expect(edgeAnnualValue(edges[1], nodes, edges)).toBe(9600);
	});

	it("clamps remainder to zero when non-remainder exceeds inflow", () => {
		const nodes = [income("inc", 1000), checking("a"), checking("b")];
		const edges = [
			alloc("e1", "inc", "a", {
				mode: "fixed",
				amount: 9999,
				frequency: "monthly",
			}),
			alloc("e2", "inc", "b", { mode: "remainder" }),
		];
		expect(edgeAnnualValue(edges[1], nodes, edges)).toBe(0);
	});

	it("returns 0 when allocation edge has no data", () => {
		const nodes = [income("inc", 1000), checking("chk")];
		const edges = [{ id: "e", source: "inc", target: "chk", type: "allocation" } as Edge];
		expect(edgeAnnualValue(edges[0], nodes, edges)).toBe(0);
	});
});

describe("computeNodeUtilization", () => {
	it("flags over-allocation when fixed siblings exceed inflow", () => {
		const nodes = [income("inc", 1000), checking("a")];
		const edges = [
			alloc("e", "inc", "a", {
				mode: "fixed",
				amount: 2000,
				frequency: "monthly",
			}),
		];
		const u = computeNodeUtilization("inc", nodes, edges);
		expect(u.over).toBe(true);
		expect(u.allocatedAnnual).toBe(u.totalAnnual);
		expect(u.unallocatedAnnual).toBe(0);
	});

	it("reports leftover when no remainder edge consumes it", () => {
		const nodes = [income("inc", 1000), checking("a")];
		const edges = [
			alloc("e", "inc", "a", {
				mode: "fixed",
				amount: 100,
				frequency: "monthly",
			}),
		];
		const u = computeNodeUtilization("inc", nodes, edges);
		expect(u.over).toBe(false);
		expect(u.totalAnnual).toBe(12000);
		expect(u.allocatedAnnual).toBe(1200);
		expect(u.unallocatedAnnual).toBe(10800);
	});

	it("treats remainder as fully consuming leftover", () => {
		const nodes = [income("inc", 1000), checking("a"), checking("b")];
		const edges = [
			alloc("e1", "inc", "a", {
				mode: "fixed",
				amount: 100,
				frequency: "monthly",
			}),
			alloc("e2", "inc", "b", { mode: "remainder" }),
		];
		const u = computeNodeUtilization("inc", nodes, edges);
		expect(u.unallocatedAnnual).toBe(0);
		expect(u.allocatedAnnual).toBe(12000);
	});
});

describe("nodeAnnualOutflow", () => {
	it("equals the utilization's allocatedAnnual", () => {
		const nodes = [income("inc", 1000), checking("a")];
		const edges = [
			alloc("e", "inc", "a", {
				mode: "fixed",
				amount: 100,
				frequency: "monthly",
			}),
		];
		expect(nodeAnnualOutflow("inc", nodes, edges)).toBe(1200);
	});
});

describe("edgeStrokeWidth", () => {
	it("returns the minimum width when there is no flow", () => {
		const nodes = [income("inc", 0), checking("chk")];
		const edges = [alloc("e", "inc", "chk", { mode: "remainder" })];
		expect(edgeStrokeWidth(edges[0], nodes, edges)).toBe(1);
	});

	it("returns the max for the largest edge in the graph", () => {
		const nodes = [income("inc", 1000), checking("a"), checking("b")];
		const edges = [
			alloc("e1", "inc", "a", { mode: "percent", percent: 80 }),
			alloc("e2", "inc", "b", { mode: "percent", percent: 20 }),
		];
		expect(edgeStrokeWidth(edges[0], nodes, edges)).toBeCloseTo(6);
	});

	it("uses sqrt scaling between min and max", () => {
		const nodes = [income("inc", 1000), checking("a"), checking("b")];
		const edges = [
			alloc("e1", "inc", "a", { mode: "percent", percent: 100 }),
			alloc("e2", "inc", "b", { mode: "percent", percent: 25 }),
		];
		// e2 ratio = 0.25, sqrt = 0.5 → 1 + 5*0.5 = 3.5
		expect(edgeStrokeWidth(edges[1], nodes, edges)).toBeCloseTo(3.5);
	});
});
