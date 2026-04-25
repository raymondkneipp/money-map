import { useEdges, useNodes, useReactFlow } from "@xyflow/react";
import type {
	AllocationEdgeData,
	CheckingNodeData,
	CryptoNodeData,
	ExpenseNodeData,
	IncomeNodeData,
	RetirementNodeData,
	SavingsNodeData,
} from "../types";
import { CheckingEditor } from "./checking-editor";
import { CryptoEditor } from "./crypto-editor";
import { EdgeEditor } from "./edge-editor";
import { ExpenseEditor } from "./expense-editor";
import { IncomeEditor } from "./income-editor";
import { RetirementEditor } from "./retirement-editor";
import { SavingsEditor } from "./savings-editor";

export function NodeEditor() {
	const nodes = useNodes();
	const edges = useEdges();
	const { updateNodeData, updateEdgeData } = useReactFlow();

	const selectedNode = nodes.find((n) => n.selected);
	const selectedEdge = edges.find((e) => e.selected);

	if (selectedNode) {
		if (selectedNode.type === "incomeNode") {
			return (
				<IncomeEditor
					node={selectedNode as IncomeNodeData}
					onChange={updateNodeData}
				/>
			);
		}
		if (selectedNode.type === "checkingNode") {
			return (
				<CheckingEditor
					node={selectedNode as CheckingNodeData}
					onChange={updateNodeData}
				/>
			);
		}
		if (selectedNode.type === "savingsNode") {
			return (
				<SavingsEditor
					node={selectedNode as SavingsNodeData}
					onChange={updateNodeData}
				/>
			);
		}
		if (selectedNode.type === "expenseNode") {
			return (
				<ExpenseEditor
					node={selectedNode as ExpenseNodeData}
					onChange={updateNodeData}
				/>
			);
		}
		if (selectedNode.type === "cryptoNode") {
			return (
				<CryptoEditor
					node={selectedNode as CryptoNodeData}
					onChange={updateNodeData}
				/>
			);
		}
		if (selectedNode.type === "retirementNode") {
			return (
				<RetirementEditor
					node={selectedNode as RetirementNodeData}
					onChange={updateNodeData}
				/>
			);
		}
		return (
			<div className="px-4 py-3 text-sm text-muted-foreground">
				No editor for this node type yet.
			</div>
		);
	}

	if (selectedEdge?.type === "allocation") {
		return (
			<EdgeEditor
				edge={selectedEdge}
				onChange={(id, data: AllocationEdgeData) => updateEdgeData(id, data)}
			/>
		);
	}

	if (selectedEdge?.type === "expense") {
		return (
			<div className="px-4 py-3 text-sm text-muted-foreground">
				Expense amount is set on the expense node itself.
			</div>
		);
	}

	return (
		<div className="px-4 py-3 text-sm text-muted-foreground">
			Select a node or edge to edit it.
		</div>
	);
}
