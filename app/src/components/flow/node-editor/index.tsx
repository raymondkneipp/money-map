import { useNodes, useReactFlow } from "@xyflow/react";
import type { IncomeNodeData } from "../types";
import { IncomeEditor } from "./income-editor";

export function NodeEditor() {
	const nodes = useNodes();
	const { updateNodeData } = useReactFlow();

	const selected = nodes.find((n) => n.selected);

	if (!selected) {
		return (
			<div className="px-4 py-3 text-sm text-muted-foreground">
				Select a node to edit it.
			</div>
		);
	}

	if (selected.type === "incomeNode") {
		return (
			<IncomeEditor
				node={selected as IncomeNodeData}
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
