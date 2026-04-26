import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	Background,
	type Connection,
	type Edge,
	type EdgeChange,
	type NodeChange,
	ReactFlow,
} from "@xyflow/react";
import { useCallback, useState } from "react";
import "@xyflow/react/dist/style.css";
import {
	buildEdgeForConnection,
	isValidConnection as isValidConnectionRule,
} from "#/lib/edge-rules";
import { AllocationEdge } from "./allocation-edge";
import { BaseNodeFullDemo } from "./base-node-full-demo";
import { ExpenseEdge } from "./expense-edge";
import { useFlowState } from "./flow-state";
import { FlowToolbar } from "./flow-toolbar";
import { AssetNode } from "./nodes/asset-node";
import { CheckingNode } from "./nodes/checking-node";
import { CryptoNode } from "./nodes/crypto-node";
import { DebtNode } from "./nodes/debt-node";
import { EmergencyFundNode } from "./nodes/emergency-fund-node";
import { ExpenseNode } from "./nodes/expense-node";
import { IncomeNode } from "./nodes/income-node";
import { RetirementNode } from "./nodes/retirement-node";
import { SavingsNode } from "./nodes/savings-node";

const nodeTypes = {
	baseNodeFull: BaseNodeFullDemo,
	incomeNode: IncomeNode,
	checkingNode: CheckingNode,
	savingsNode: SavingsNode,
	emergencyFundNode: EmergencyFundNode,
	expenseNode: ExpenseNode,
	cryptoNode: CryptoNode,
	retirementNode: RetirementNode,
	assetNode: AssetNode,
	debtNode: DebtNode,
};

const edgeTypes = {
	allocation: AllocationEdge,
	expense: ExpenseEdge,
};

export function Flow() {
	const { nodes, edges, setNodes, setEdges } = useFlowState();
	const [interactive, setInteractive] = useState(true);

	const onNodesChange = useCallback(
		(changes: NodeChange[]) =>
			setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
		[],
	);
	const onEdgesChange = useCallback(
		(changes: EdgeChange[]) =>
			setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
		[],
	);

	const onConnect = useCallback(
		(params: Connection) => {
			const newEdge = buildEdgeForConnection(params, nodes);
			setEdges((es) => addEdge(newEdge, es));
		},
		[nodes, setEdges],
	);

	const isValidConnection = useCallback(
		(c: Connection | Edge) => isValidConnectionRule(c, nodes, edges),
		[nodes, edges],
	);

	return (
		<ReactFlow
			nodes={nodes}
			edges={edges}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			onConnect={onConnect}
			isValidConnection={isValidConnection}
			nodeTypes={nodeTypes}
			edgeTypes={edgeTypes}
			nodesDraggable={interactive}
			nodesConnectable={interactive}
			elementsSelectable={interactive}
			snapToGrid
			snapGrid={[20, 20]}
			selectNodesOnDrag={false}
			fitView
			fitViewOptions={{ padding: 0.1 }}
			proOptions={{
				hideAttribution: true,
			}}
		>
			<Background />
			<FlowToolbar
				interactive={interactive}
				onInteractiveChange={setInteractive}
			/>
		</ReactFlow>
	);
}
