import {
	BaseEdge,
	EdgeLabelRenderer,
	type EdgeProps,
	getBezierPath,
	useEdges,
	useNodes,
} from "@xyflow/react";
import { edgeAnnualValue, edgeStrokeWidth, formatAnnualAs } from "./allocation";
import type { AllocationEdgeData } from "./types";

// display detail in the source income's frequency when we can find one
// upstream; fall back to monthly otherwise.
function displayFrequencyFor(
	sourceId: string,
	nodes: ReturnType<typeof useNodes>,
	edges: ReturnType<typeof useEdges>,
	visited: Set<string> = new Set(),
): "monthly" | import("./types").Frequency {
	if (visited.has(sourceId)) return "monthly";
	const node = nodes.find((n) => n.id === sourceId);
	if (!node) return "monthly";
	if (node.type === "incomeNode") {
		return (node as import("./types").IncomeNodeData).data.frequency;
	}
	const next = new Set(visited);
	next.add(sourceId);
	for (const e of edges) {
		if (e.target !== sourceId || e.type !== "allocation") continue;
		return displayFrequencyFor(e.source, nodes, edges, next);
	}
	return "monthly";
}

function formatRule(data: AllocationEdgeData | undefined): string {
	if (!data) return "—";
	if (data.mode === "percent") {
		return `${data.percent ?? 0}%`;
	}
	if (data.mode === "fixed" && data.amount != null && data.frequency) {
		const fmt = new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			maximumFractionDigits: 0,
		}).format(data.amount);
		return `${fmt}/${data.frequency.slice(0, 2)}`;
	}
	if (data.mode === "remainder") {
		return "rest";
	}

	return "—";
}

export function AllocationEdge({
	id,
	source,
	target,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	data,
	selected,
}: EdgeProps) {
	const nodes = useNodes();
	const edges = useEdges();
	const [path, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	const edgeData = data as AllocationEdgeData | undefined;
	const rule = formatRule(edgeData);

	// compute effective $/period; choose a display frequency matching the
	// ultimate income source (fallback monthly)
	const edgeShape = {
		id,
		source,
		target,
		data: edgeData,
		type: "allocation",
	} as never;
	const annual = edgeAnnualValue(edgeShape, nodes, edges);
	const displayFrequency = displayFrequencyFor(source, nodes, edges);
	const detail = annual > 0 ? formatAnnualAs(annual, displayFrequency) : null;
	const strokeWidth = edgeStrokeWidth(edgeShape, nodes, edges);

	return (
		<>
			<BaseEdge id={id} path={path} style={{ strokeWidth }} />
			<EdgeLabelRenderer>
				<div
					style={{
						transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
					}}
					className={`nodrag nopan pointer-events-auto absolute rounded-md border bg-card px-2 py-0.5 text-xs font-medium shadow-sm ${
						selected ? "ring-2 ring-ring" : ""
					}`}
				>
					<span>{rule}</span>
					{detail && (
						<span className="ml-1 text-muted-foreground">({detail})</span>
					)}
				</div>
			</EdgeLabelRenderer>
		</>
	);
}
