/**
 * Pure operations on a `ScenariosState` (the shape persisted in localStorage).
 * Kept side-effect-free so they're trivially unit-testable: every function
 * takes the previous state and returns the next state. The React provider in
 * `flow-state.tsx` wires these into a `useState` reducer.
 */

import type { Edge, Node } from "@xyflow/react";

export type Scenario = {
	id: string;
	name: string;
	nodes: Node[];
	edges: Edge[];
};

export type ScenariosState = {
	scenarios: Scenario[];
	activeId: string;
};

/** Stable, unique-enough id generator (uses `crypto.randomUUID` when available). */
export function generateScenarioId(): string {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}
	return Math.random().toString(36).slice(2, 11);
}

/** Locate the active scenario, falling back to the first if the id is stale. */
export function getActiveScenario(state: ScenariosState): Scenario {
	return (
		state.scenarios.find((s) => s.id === state.activeId) ?? state.scenarios[0]
	);
}

/** Replace the active scenario's `nodes` array. */
export function setActiveNodes(
	state: ScenariosState,
	nodes: Node[],
): ScenariosState {
	const idx = state.scenarios.findIndex((s) => s.id === state.activeId);
	if (idx < 0) return state;
	const scenarios = [...state.scenarios];
	scenarios[idx] = { ...scenarios[idx], nodes };
	return { ...state, scenarios };
}

/** Replace the active scenario's `edges` array. */
export function setActiveEdges(
	state: ScenariosState,
	edges: Edge[],
): ScenariosState {
	const idx = state.scenarios.findIndex((s) => s.id === state.activeId);
	if (idx < 0) return state;
	const scenarios = [...state.scenarios];
	scenarios[idx] = { ...scenarios[idx], edges };
	return { ...state, scenarios };
}

/** Switch the active scenario; no-op if `id` doesn't exist. */
export function setActiveScenarioId(
	state: ScenariosState,
	id: string,
): ScenariosState {
	return state.scenarios.some((s) => s.id === id)
		? { ...state, activeId: id }
		: state;
}

/**
 * Append a new scenario and make it active. If `fromId` is given, copy that
 * scenario's nodes/edges; otherwise start blank. `name` defaults to either
 * "<source> copy" or "New scenario".
 */
export function createScenario(
	state: ScenariosState,
	opts: { id: string; name?: string; fromId?: string },
): ScenariosState {
	const source = opts.fromId
		? state.scenarios.find((s) => s.id === opts.fromId)
		: null;
	const name = opts.name ?? (source ? `${source.name} copy` : "New scenario");
	const scenario: Scenario = source
		? { id: opts.id, name, nodes: source.nodes, edges: source.edges }
		: { id: opts.id, name, nodes: [], edges: [] };
	return {
		scenarios: [...state.scenarios, scenario],
		activeId: opts.id,
	};
}

/** Rename a scenario. Empty/whitespace names are ignored. */
export function renameScenario(
	state: ScenariosState,
	id: string,
	name: string,
): ScenariosState {
	const trimmed = name.trim();
	if (!trimmed) return state;
	return {
		...state,
		scenarios: state.scenarios.map((s) =>
			s.id === id ? { ...s, name: trimmed } : s,
		),
	};
}

/** Delete a scenario. Refuses to delete the last remaining one. */
export function deleteScenario(
	state: ScenariosState,
	id: string,
): ScenariosState {
	if (state.scenarios.length <= 1) return state;
	const remaining = state.scenarios.filter((s) => s.id !== id);
	const activeId = state.activeId === id ? remaining[0].id : state.activeId;
	return { scenarios: remaining, activeId };
}
