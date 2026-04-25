import {
	BaseEdge,
	type EdgeProps,
	getBezierPath,
	useEdges,
	useNodes,
} from "@xyflow/react";
import { edgeStrokeWidth } from "./allocation";

export function ExpenseEdge({
	id,
	source,
	target,
	data,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
}: EdgeProps) {
	const nodes = useNodes();
	const edges = useEdges();
	const [path] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	const strokeWidth = edgeStrokeWidth(
		{ id, source, target, data, type: "expense" } as never,
		nodes,
		edges,
	);

	return <BaseEdge id={id} path={path} style={{ strokeWidth }} />;
}
