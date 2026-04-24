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
import { BaseNodeFullDemo } from "./base-node-full-demo";
import { initialEdges, initialNodes } from "./data";
import { IncomeNode } from "./income-node";

const nodeTypes = {
	baseNodeFull: BaseNodeFullDemo,
	incomeNode: IncomeNode,
};

export function Flow() {
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
