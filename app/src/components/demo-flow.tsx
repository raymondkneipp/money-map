import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	Background,
	Controls,
	ReactFlow,
} from "@xyflow/react";
import { useCallback, useState } from "react";
import "@xyflow/react/dist/style.css";
import { BaseNodeFullDemo } from "./flow/base-node-full-demo";
import { IncomeNode } from "./flow/income-node";

const nodeTypes = {
	baseNodeFull: BaseNodeFullDemo,
	incomeNode: IncomeNode,
};

const initialNodes = [
	{
		id: "n1",
		position: { x: 0, y: 0 },
		data: { label: "Node 1" },
		type: "baseNodeFull",
	},
	{
		id: "n2",
		position: { x: 100, y: 100 },
		data: { label: "Node 2" },
		type: "baseNodeFull",
	},
	{
		id: "income1",
		position: { x: 200, y: 100 },
		data: { label: "Income 1", value: 1000 },
		type: "incomeNode",
	},
];
const initialEdges = [{ id: "n1-n2", source: "n1", target: "n2" }];

export default function DemoFlow() {
	const [nodes, setNodes] = useState(initialNodes);
	const [edges, setEdges] = useState(initialEdges);

	const onNodesChange = useCallback(
		(changes) =>
			setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
		[],
	);
	const onEdgesChange = useCallback(
		(changes) =>
			setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
		[],
	);
	const onConnect = useCallback(
		(params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
		[],
	);

	return (
		<ReactFlow
			nodes={nodes}
			edges={edges}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			onConnect={onConnect}
			nodeTypes={nodeTypes}
			fitView
			fitViewOptions={{ padding: 0 }}
			proOptions={{
				hideAttribution: true,
			}}
		>
			<Background />
			<Controls position="bottom-center" orientation="horizontal" />
		</ReactFlow>
	);
}
