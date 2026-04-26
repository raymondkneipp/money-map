import { useEdges, useNodes, useReactFlow } from "@xyflow/react";
import type {
	AllocationEdgeData,
	AssetNodeData,
	CheckingNodeData,
	CryptoNodeData,
	DebtNodeData,
	EmergencyFundNodeData,
	ExpenseNodeData,
	IncomeNodeData,
	RetirementNodeData,
	SavingsNodeData,
} from "../types";
import { AssetEditor } from "./asset-editor";
import { CheckingEditor } from "./checking-editor";
import { CryptoEditor } from "./crypto-editor";
import { DebtEditor } from "./debt-editor";
import { EdgeEditor } from "./edge-editor";
import { EmergencyFundEditor } from "./emergency-fund-editor";
import { ExpenseEditor } from "./expense-editor";
import { IncomeEditor } from "./income-editor";
import { NodePreviewChart } from "./node-preview-chart";
import { RetirementEditor } from "./retirement-editor";
import { SavingsEditor } from "./savings-editor";

export function NodeEditor() {
	const nodes = useNodes();
	const edges = useEdges();
	const { updateNodeData, updateEdgeData } = useReactFlow();

	const selectedNode = nodes.find((n) => n.selected);
	const selectedEdge = edges.find((e) => e.selected);

	if (selectedNode) {
		let editor: React.ReactNode;
		if (selectedNode.type === "incomeNode") {
			editor = (
				<IncomeEditor
					node={selectedNode as IncomeNodeData}
					onChange={updateNodeData}
				/>
			);
		} else if (selectedNode.type === "checkingNode") {
			editor = (
				<CheckingEditor
					node={selectedNode as CheckingNodeData}
					onChange={updateNodeData}
				/>
			);
		} else if (selectedNode.type === "savingsNode") {
			editor = (
				<SavingsEditor
					node={selectedNode as SavingsNodeData}
					onChange={updateNodeData}
				/>
			);
		} else if (selectedNode.type === "emergencyFundNode") {
			editor = (
				<EmergencyFundEditor
					node={selectedNode as EmergencyFundNodeData}
					onChange={updateNodeData}
				/>
			);
		} else if (selectedNode.type === "expenseNode") {
			editor = (
				<ExpenseEditor
					node={selectedNode as ExpenseNodeData}
					onChange={updateNodeData}
				/>
			);
		} else if (selectedNode.type === "cryptoNode") {
			editor = (
				<CryptoEditor
					node={selectedNode as CryptoNodeData}
					onChange={updateNodeData}
				/>
			);
		} else if (selectedNode.type === "retirementNode") {
			editor = (
				<RetirementEditor
					node={selectedNode as RetirementNodeData}
					onChange={updateNodeData}
				/>
			);
		} else if (selectedNode.type === "debtNode") {
			editor = (
				<DebtEditor
					node={selectedNode as DebtNodeData}
					onChange={updateNodeData}
				/>
			);
		} else if (selectedNode.type === "assetNode") {
			editor = (
				<AssetEditor
					node={selectedNode as AssetNodeData}
					onChange={updateNodeData}
				/>
			);
		} else {
			editor = (
				<div className="px-4 py-3 text-sm text-muted-foreground">
					No editor for this node type yet.
				</div>
			);
		}
		return (
			<>
				<NodePreviewChart node={selectedNode} />
				{editor}
			</>
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
