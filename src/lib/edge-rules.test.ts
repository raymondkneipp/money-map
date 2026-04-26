import type { Connection, Edge } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import { buildEdgeForConnection, isValidConnection } from "./edge-rules";

type N = { id: string; type: string };

const nodes: N[] = [
	{ id: "income", type: "incomeNode" },
	{ id: "checking", type: "checkingNode" },
	{ id: "savings", type: "savingsNode" },
	{ id: "expense", type: "expenseNode" },
	{ id: "debt", type: "debtNode" },
	{ id: "asset", type: "assetNode" },
	{ id: "retirement", type: "retirementNode" },
	{ id: "crypto", type: "cryptoNode" },
];

function conn(source: string, target: string): Connection {
	return { source, target, sourceHandle: null, targetHandle: null };
}

describe("isValidConnection", () => {
	it("rejects self-loops", () => {
		expect(isValidConnection(conn("income", "income"), nodes, [])).toBe(false);
	});

	it("rejects connections with missing endpoints", () => {
		expect(isValidConnection(conn("income", "ghost"), nodes, [])).toBe(false);
	});

	it("allows income → checking", () => {
		expect(isValidConnection(conn("income", "checking"), nodes, [])).toBe(true);
	});

	it("blocks checking → checking (only income can fund checking)", () => {
		const extra = [...nodes, { id: "c2", type: "checkingNode" }];
		expect(isValidConnection(conn("checking", "c2"), extra, [])).toBe(false);
	});

	it("allows income or checking → savings, expense, crypto", () => {
		for (const target of ["savings", "expense", "crypto"]) {
			expect(isValidConnection(conn("income", target), nodes, [])).toBe(true);
			expect(isValidConnection(conn("checking", target), nodes, [])).toBe(true);
		}
	});

	it("blocks savings → savings", () => {
		const extra = [...nodes, { id: "s2", type: "savingsNode" }];
		expect(isValidConnection(conn("savings", "s2"), extra, [])).toBe(false);
	});

	it("retirement only accepts income, and only one source", () => {
		expect(isValidConnection(conn("checking", "retirement"), nodes, [])).toBe(
			false,
		);
		expect(isValidConnection(conn("income", "retirement"), nodes, [])).toBe(
			true,
		);
		const existing: Edge[] = [
			{ id: "e", source: "income", target: "retirement" },
		];
		expect(
			isValidConnection(conn("income", "retirement"), nodes, existing),
		).toBe(false);
	});

	it("asset & debt only accept checking sources", () => {
		expect(isValidConnection(conn("income", "asset"), nodes, [])).toBe(false);
		expect(isValidConnection(conn("checking", "asset"), nodes, [])).toBe(true);
		expect(isValidConnection(conn("income", "debt"), nodes, [])).toBe(false);
		expect(isValidConnection(conn("checking", "debt"), nodes, [])).toBe(true);
	});

	it("expense accepts only one incoming edge", () => {
		const existing: Edge[] = [
			{ id: "e", source: "income", target: "expense" },
		];
		expect(
			isValidConnection(conn("checking", "expense"), nodes, existing),
		).toBe(false);
	});

	it("rejects duplicate (source, target) pairs", () => {
		const existing: Edge[] = [
			{ id: "e", source: "income", target: "checking" },
		];
		expect(
			isValidConnection(conn("income", "checking"), nodes, existing),
		).toBe(false);
	});
});

describe("buildEdgeForConnection", () => {
	it("returns an expense edge when the target is an expense node", () => {
		const e = buildEdgeForConnection(conn("checking", "expense"), nodes);
		expect(e.type).toBe("expense");
	});

	it("returns an allocation edge with remainder data when source is income/checking", () => {
		const e = buildEdgeForConnection(conn("income", "savings"), nodes);
		expect(e.type).toBe("allocation");
		expect((e as Edge<{ mode: string }>).data?.mode).toBe("remainder");
	});

	it("falls back to a default edge when neither rule matches", () => {
		const orphan = [...nodes, { id: "x", type: "unknownNode" }];
		const e = buildEdgeForConnection(conn("x", "savings"), orphan);
		expect(e.type).toBeUndefined();
	});

	it("uses a deterministic id format including source and target", () => {
		const e = buildEdgeForConnection(conn("income", "checking"), nodes);
		expect(e.id.startsWith("income-checking-")).toBe(true);
	});
});
