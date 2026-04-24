import {
	BaseEdge,
	EdgeLabelRenderer,
	type EdgeProps,
	getBezierPath,
	useNodes,
} from "@xyflow/react";
import type { ExpenseNodeData } from "./types";
import { FREQUENCY_BY_ID } from "./types";

export function ExpenseEdge({
	id,
	target,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	selected,
}: EdgeProps) {
	const nodes = useNodes();
	const [path, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	const targetNode = nodes.find((n) => n.id === target);
	let label: string | null = null;
	if (targetNode?.type === "expenseNode") {
		const d = (targetNode as ExpenseNodeData).data;
		const fmt = new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			maximumFractionDigits: 0,
		}).format(d.amount);
		label = `${fmt}/${FREQUENCY_BY_ID[d.frequency].abbr}`;
	}

	return (
		<>
			<BaseEdge id={id} path={path} />
			<EdgeLabelRenderer>
				<div
					style={{
						transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
					}}
					className={`nodrag nopan pointer-events-auto absolute rounded-md border bg-card px-2 py-0.5 text-xs font-medium shadow-sm ${
						selected ? "ring-2 ring-ring" : ""
					}`}
				>
					{label ?? "—"}
				</div>
			</EdgeLabelRenderer>
		</>
	);
}
