import type { Edge, Node } from "@xyflow/react";
import {
	type AllocationEdgeData,
	type ExpenseNodeData,
	FREQUENCY_BY_ID,
	type Frequency,
	type IncomeNodeData,
	type RetirementNodeData,
	toAnnual,
} from "./types";

/**
 * Annualized cost pulled by an `expense`-type edge: sourced from the
 * target expense node's own amount/frequency. Returns 0 if target is
 * missing or not an expense node.
 */
function expenseEdgeAnnual(edge: Edge, nodes: Node[]): number {
	const target = nodes.find((n) => n.id === edge.target);
	if (target?.type !== "expenseNode") return 0;
	const d = (target as ExpenseNodeData).data;
	return toAnnual(d.amount, d.frequency);
}

export type NodeUtilization = {
	totalAnnual: number;
	allocatedAnnual: number;
	unallocatedAnnual: number;
	over: boolean;
};

/**
 * Annualized inflow for a node. Income nodes produce their own money
 * (`amount * perYear`). Any other node's inflow is the sum of its incoming
 * allocation edges — which in turn depend on *their* source's inflow,
 * resolved recursively.
 *
 * `visited` guards against cycles; a cycle short-circuits to 0 at the revisit.
 */
export function nodeAnnualInflow(
	nodeId: string,
	nodes: Node[],
	edges: Edge[],
	visited: Set<string> = new Set(),
): number {
	if (visited.has(nodeId)) return 0;
	const node = nodes.find((n) => n.id === nodeId);
	if (!node) return 0;

	if (node.type === "incomeNode") {
		const d = (node as IncomeNodeData).data;
		return toAnnual(d.amount, d.frequency);
	}

	const nextVisited = new Set(visited);
	nextVisited.add(nodeId);

	let sum = 0;
	for (const e of edges) {
		if (e.target !== nodeId) continue;
		if (e.type !== "allocation" && e.type !== "expense") continue;
		sum += edgeAnnualValue(e, nodes, edges, nextVisited);
	}

	// 401(k) inflow is grossed up by the node's employer match percentage.
	if (node.type === "retirementNode") {
		const d = (node as RetirementNodeData).data;
		return sum * (1 + d.employerMatch / 100);
	}

	return sum;
}

/**
 * Annual value of a single allocation edge. Percent/remainder are resolved
 * against the source node's own inflow (income amount, or upstream
 * allocations for checking/savings).
 */
export function edgeAnnualValue(
	edge: Edge,
	nodes: Node[],
	edges: Edge[],
	visited: Set<string> = new Set(),
): number {
	if (edge.type === "expense") {
		return expenseEdgeAnnual(edge, nodes);
	}

	const d = edge.data as AllocationEdgeData | undefined;
	if (!d) return 0;

	if (d.mode === "fixed" && d.amount != null && d.frequency) {
		return toAnnual(d.amount, d.frequency);
	}

	const sourceInflow = nodeAnnualInflow(edge.source, nodes, edges, visited);

	if (d.mode === "percent" && d.percent != null) {
		return sourceInflow * (d.percent / 100);
	}

	if (d.mode === "remainder") {
		const siblings = edges.filter(
			(e) =>
				e.source === edge.source &&
				(e.type === "allocation" || e.type === "expense"),
		);
		let nonRemainder = 0;
		let remainderCount = 0;
		for (const s of siblings) {
			if (s.type === "expense") {
				nonRemainder += expenseEdgeAnnual(s, nodes);
				continue;
			}
			const sd = s.data as AllocationEdgeData | undefined;
			if (!sd) continue;
			if (sd.mode === "fixed" && sd.amount != null && sd.frequency) {
				nonRemainder += toAnnual(sd.amount, sd.frequency);
			} else if (sd.mode === "percent" && sd.percent != null) {
				nonRemainder += sourceInflow * (sd.percent / 100);
			} else if (sd.mode === "remainder") {
				remainderCount++;
			}
		}
		if (remainderCount === 0) return 0;
		return Math.max(0, sourceInflow - nonRemainder) / remainderCount;
	}

	return 0;
}

/**
 * How much of a node's annualized inflow is consumed by its outgoing
 * allocation edges. Over-allocation flips `over` and remainder edges get 0.
 */
export function computeNodeUtilization(
	nodeId: string,
	nodes: Node[],
	edges: Edge[],
): NodeUtilization {
	const totalAnnual = nodeAnnualInflow(nodeId, nodes, edges);
	const outgoing = edges.filter(
		(e) =>
			e.source === nodeId && (e.type === "allocation" || e.type === "expense"),
	);

	let nonRemainder = 0;
	let remainderCount = 0;

	for (const e of outgoing) {
		if (e.type === "expense") {
			nonRemainder += expenseEdgeAnnual(e, nodes);
			continue;
		}
		const d = e.data as AllocationEdgeData | undefined;
		if (!d) continue;
		if (d.mode === "fixed" && d.amount != null && d.frequency) {
			nonRemainder += toAnnual(d.amount, d.frequency);
		} else if (d.mode === "percent" && d.percent != null) {
			nonRemainder += totalAnnual * (d.percent / 100);
		} else if (d.mode === "remainder") {
			remainderCount++;
		}
	}

	const over = nonRemainder > totalAnnual + 1e-6;
	const leftover = Math.max(0, totalAnnual - nonRemainder);
	const allocatedAnnual = over
		? totalAnnual
		: nonRemainder + (remainderCount > 0 ? leftover : 0);

	return {
		totalAnnual,
		allocatedAnnual,
		unallocatedAnnual: Math.max(0, totalAnnual - allocatedAnnual),
		over,
	};
}

/**
 * Total annualized outflow from a node (sum of its outgoing allocation
 * edges, capped at the node's own inflow — you can't move more out than
 * comes in).
 */
export function nodeAnnualOutflow(
	nodeId: string,
	nodes: Node[],
	edges: Edge[],
): number {
	const util = computeNodeUtilization(nodeId, nodes, edges);
	return util.allocatedAnnual;
}

/**
 * Stroke width for an edge, scaled so the largest-flow edge in the graph is
 * thickest and the smallest is thinnest. Uses a sqrt curve so a 100× ratio in
 * dollar flow doesn't translate to a 100× ratio in pixel width.
 */
export function edgeStrokeWidth(
	edge: Edge,
	nodes: Node[],
	edges: Edge[],
): number {
	const MIN = 1;
	const MAX = 6;
	const annual = edgeAnnualValue(edge, nodes, edges);
	let maxAnnual = 0;
	for (const e of edges) {
		const v = edgeAnnualValue(e, nodes, edges);
		if (v > maxAnnual) maxAnnual = v;
	}
	if (maxAnnual <= 0 || annual <= 0) return MIN;
	const ratio = Math.min(1, annual / maxAnnual);
	return MIN + (MAX - MIN) * Math.sqrt(ratio);
}

/**
 * Format annual amount back to a user-friendly string in the target frequency.
 */
export function formatAnnualAs(annual: number, frequency: Frequency): string {
	const perPeriod = annual / FREQUENCY_BY_ID[frequency].perYear;
	const formatted = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0,
	}).format(perPeriod);
	return `${formatted}/${FREQUENCY_BY_ID[frequency].abbr}`;
}
