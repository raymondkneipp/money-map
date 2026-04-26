/**
 * Integration: scenarios + metrics. Each scenario carries its own graph,
 * mutating one (after a clone) must not change the other, and per-scenario
 * metrics must reflect that scenario's wiring.
 */

import type { Edge, Node } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import { nodeAnnualInflow } from "#/lib/allocation";
import {
	createScenario,
	getActiveScenario,
	setActiveEdges,
	setActiveNodes,
	setActiveScenarioId,
	type ScenariosState,
} from "#/lib/scenarios";

const at = (x = 0, y = 0) => ({ x, y });

const income = (id: string, monthly: number): Node =>
	({
		id,
		type: "incomeNode",
		position: at(),
		data: { name: id, amount: monthly, frequency: "monthly", passive: false },
	}) as never;

const checking = (id: string): Node =>
	({
		id,
		type: "checkingNode",
		position: at(),
		data: { name: id, principal: 0, apy: 0 },
	}) as never;

const savings = (id: string): Node =>
	({
		id,
		type: "savingsNode",
		position: at(),
		data: { name: id, principal: 0, apy: 0 },
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

const allocRemainder = (id: string, source: string, target: string): Edge =>
	({
		id,
		source,
		target,
		type: "allocation",
		data: { mode: "remainder" },
	}) as Edge;

// Compute "what the active scenario thinks about node X", using only the
// scenario's stored graph. Mirrors how the live UI reads from state.
function activeInflow(state: ScenariosState, nodeId: string): number {
	const s = getActiveScenario(state);
	return nodeAnnualInflow(nodeId, s.nodes, s.edges);
}

describe("scenarios — independent graphs, independent metrics", () => {
	function seedBaseline(): ScenariosState {
		// Baseline scenario: $5k/mo income, all to checking, $200/mo to savings.
		const nodes: Node[] = [income("inc", 5000), checking("chk"), savings("sav")];
		const edges: Edge[] = [
			allocRemainder("e1", "inc", "chk"),
			allocFixed("e2", "chk", "sav", 200),
		];
		return {
			scenarios: [{ id: "base", name: "Baseline", nodes, edges }],
			activeId: "base",
		};
	}

	it("baseline computes the expected savings inflow", () => {
		expect(activeInflow(seedBaseline(), "sav")).toBe(2_400);
	});

	it("clone via createScenario starts with the same metrics", () => {
		const state = createScenario(seedBaseline(), { id: "stretch", fromId: "base" });
		expect(getActiveScenario(state).id).toBe("stretch");
		expect(activeInflow(state, "sav")).toBe(2_400);
	});

	it("editing the clone (raise savings to $1k/mo) does not affect baseline", () => {
		let state = createScenario(seedBaseline(), {
			id: "stretch",
			fromId: "base",
		});
		// While `stretch` is active, mutate its savings allocation to $1,000/mo.
		const active = getActiveScenario(state);
		const newEdges = active.edges.map((e) =>
			e.id === "e2"
				? ({
						...e,
						data: { mode: "fixed", amount: 1000, frequency: "monthly" },
					} as Edge)
				: e,
		);
		state = setActiveEdges(state, newEdges);

		// Active (stretch) reflects the change.
		expect(activeInflow(state, "sav")).toBe(12_000);

		// Switch back to baseline — its metrics are unchanged.
		state = setActiveScenarioId(state, "base");
		expect(activeInflow(state, "sav")).toBe(2_400);
	});

	it("adding a node to one scenario doesn't leak into siblings", () => {
		let state = createScenario(seedBaseline(), { id: "extra", fromId: "base" });
		const next = getActiveScenario(state);
		// Add a second savings target paid $300/mo (split — though for inflow
		// computation we only care that the new node has its own inflow).
		const moreNodes = [...next.nodes, savings("sav2")];
		const moreEdges = [
			...next.edges,
			allocFixed("e3", "chk", "sav2", 300),
		];
		state = setActiveNodes(state, moreNodes);
		state = setActiveEdges(state, moreEdges);

		expect(activeInflow(state, "sav2")).toBe(3_600);

		// Baseline doesn't have sav2 → inflow is 0 (unknown id).
		state = setActiveScenarioId(state, "base");
		expect(activeInflow(state, "sav2")).toBe(0);
	});
});
