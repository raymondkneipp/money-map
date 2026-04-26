/**
 * Pure rules that decide:
 *   1. whether a proposed connection is valid (`isValidConnection`)
 *   2. what edge object to create for an accepted connection (`buildEdgeForConnection`)
 *
 * Kept free of React/React Flow runtime concerns so they're easy to unit test
 * in isolation. The `Flow` component wires them up to React Flow's callbacks.
 */

import type { Connection, Edge } from "@xyflow/react";
import type { AllocationEdgeData } from "#/components/flow/types";

/** Source node types that can drive an allocation edge. */
const MONEY_SOURCE_TYPES = new Set(["incomeNode", "checkingNode"]);

type NodeLike = { id: string; type?: string };

/**
 * Decides if a proposed connection between two nodes is allowed. Encodes the
 * domain rules: which sources can fund which targets, single-edge constraints
 * for expenses/401(k), and a duplicate-edge guard.
 */
export function isValidConnection(
	c: Connection | Edge,
	nodes: NodeLike[],
	edges: Edge[],
): boolean {
	if (!c.source || !c.target) return false;
	if (c.source === c.target) return false;
	const source = nodes.find((n) => n.id === c.source);
	const target = nodes.find((n) => n.id === c.target);
	if (!source || !target) return false;

	// checking nodes only accept incomes as sources
	if (target.type === "checkingNode" && source.type !== "incomeNode") {
		return false;
	}
	// savings, emergency fund, crypto, and expenses accept incomes or checking
	if (
		(target.type === "savingsNode" ||
			target.type === "emergencyFundNode" ||
			target.type === "cryptoNode" ||
			target.type === "expenseNode") &&
		source.type !== "incomeNode" &&
		source.type !== "checkingNode"
	) {
		return false;
	}
	// 401(k) nodes only accept income sources — no checking, savings, etc.
	if (target.type === "retirementNode" && source.type !== "incomeNode") {
		return false;
	}
	// IRA / brokerage / other assets are funded only from checking
	if (target.type === "assetNode" && source.type !== "checkingNode") {
		return false;
	}
	// debts are paid down only from checking
	if (target.type === "debtNode" && source.type !== "checkingNode") {
		return false;
	}
	// 401(k) is funded by exactly one income source
	if (
		target.type === "retirementNode" &&
		edges.some((e) => e.target === c.target)
	) {
		return false;
	}
	// an expense can only be paid from one place — otherwise it gets
	// charged twice (once per incoming edge)
	if (
		target.type === "expenseNode" &&
		edges.some((e) => e.target === c.target)
	) {
		return false;
	}
	// no duplicate edges between the same (source, target) pair
	if (edges.some((e) => e.source === c.source && e.target === c.target)) {
		return false;
	}
	return true;
}

/**
 * Build the appropriate edge for a (validated) connection. Picks edge `type`
 * and seed `data` based on the source/target combination. Caller is responsible
 * for first checking `isValidConnection`.
 */
export function buildEdgeForConnection(
	params: Connection,
	nodes: NodeLike[],
): Edge {
	const sourceNode = nodes.find((n) => n.id === params.source);
	const targetNode = nodes.find((n) => n.id === params.target);
	const id = `${params.source}-${params.target}-${Date.now()}`;

	// expense target → "expense" edge (value comes from the expense node)
	if (targetNode?.type === "expenseNode") {
		return { ...params, id, type: "expense" };
	}

	// income/checking source → "allocation" edge with editable rule
	// (retirement targets always have an income source, so they fall here too)
	if (sourceNode?.type && MONEY_SOURCE_TYPES.has(sourceNode.type)) {
		const edge: Edge<AllocationEdgeData> = {
			...params,
			id,
			type: "allocation",
			data: { mode: "remainder" },
		};
		return edge;
	}

	return { ...params, id };
}
