import type { Edge, Node } from "@xyflow/react";
import type { IncomeNodeData } from "./types";

const incomeNodes: IncomeNodeData[] = [
	{
		id: "income1",
		position: { x: 0, y: 100 },
		data: {
			name: "Income 1",
			amount: 1000,
			frequency: "monthly",
			passive: false,
		},
		type: "incomeNode",
	},
	{
		id: "income2",
		position: { x: 0, y: 200 },
		data: {
			name: "Income 2",
			amount: 2000,
			frequency: "monthly",
			passive: true,
		},
		type: "incomeNode",
	},
];

export const initialNodes: Node[] = [
	{
		id: "n1",
		position: { x: 300, y: 0 },
		data: { label: "Node 1" },
	},
	{
		id: "n2",
		position: { x: 300, y: 100 },
		data: { label: "Node 2" },
		type: "baseNodeFull",
	},
	...incomeNodes,
];

export const initialEdges: Edge[] = [
	{ id: "n1-n2", source: "n1", target: "n2" },
];
