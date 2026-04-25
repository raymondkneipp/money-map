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
import type { AllocationEdgeData } from "./types";

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

const MONEY_SOURCE_TYPES = new Set(["incomeNode", "checkingNode"]);

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
			const sourceNode = nodes.find((n) => n.id === params.source);
			const targetNode = nodes.find((n) => n.id === params.target);
			const edgeId = `${params.source}-${params.target}-${Date.now()}`;

			// expense target → "expense" edge (value comes from the expense node)
			if (targetNode?.type === "expenseNode") {
				const newEdge: Edge = {
					...params,
					id: edgeId,
					type: "expense",
				};
				setEdges((es) => addEdge(newEdge, es));
				return;
			}

			// income/checking source → "allocation" edge with editable rule
			// (retirement targets always have an income source, so they fall here too)
			if (sourceNode?.type && MONEY_SOURCE_TYPES.has(sourceNode.type)) {
				const newEdge: Edge<AllocationEdgeData> = {
					...params,
					id: edgeId,
					type: "allocation",
					data: { mode: "remainder" },
				};
				setEdges((es) => addEdge(newEdge, es));
				return;
			}

			setEdges((es) => addEdge(params, es));
		},
		[nodes],
	);

	const isValidConnection = useCallback(
		(c: Connection | Edge) => {
			if (!c.source || !c.target) return false;
			if (c.source === c.target) return false;
			const source = nodes.find((n) => n.id === c.source);
			const target = nodes.find((n) => n.id === c.target);
			if (!source || !target) return false;
			// checking nodes only accept incomes as sources
			if (target.type === "checkingNode" && source.type !== "incomeNode") {
				return false;
			}
			// savings nodes accept incomes or checking accounts as sources
			if (
				target.type === "savingsNode" &&
				source.type !== "incomeNode" &&
				source.type !== "checkingNode"
			) {
				return false;
			}
			// emergency fund accepts incomes or checking accounts as sources
			if (
				target.type === "emergencyFundNode" &&
				source.type !== "incomeNode" &&
				source.type !== "checkingNode"
			) {
				return false;
			}
			// crypto nodes accept incomes or checking accounts as sources
			if (
				target.type === "cryptoNode" &&
				source.type !== "incomeNode" &&
				source.type !== "checkingNode"
			) {
				return false;
			}
			// expense nodes accept incomes or checking accounts as sources
			if (
				target.type === "expenseNode" &&
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
		},
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
