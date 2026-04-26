import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEdges, useNodes, useReactFlow } from "@xyflow/react";
import { Button } from "@/components/ui/button";

export function DeleteSelected() {
	const nodes = useNodes();
	const edges = useEdges();
	const { deleteElements } = useReactFlow();

	const selectedNode = nodes.find((n) => n.selected);
	const selectedEdge = edges.find((e) => e.selected);
	const hasSelection = Boolean(selectedNode || selectedEdge);

	const label = selectedNode
		? "Delete node"
		: selectedEdge?.type === "expense"
			? "Delete connection"
			: selectedEdge
				? "Delete edge"
				: "Delete";

	const onDelete = () => {
		if (!hasSelection) return;
		deleteElements({
			nodes: selectedNode ? [selectedNode] : [],
			edges: selectedEdge ? [selectedEdge] : [],
		});
	};

	return (
		<Button
			variant="destructive"
			size="sm"
			className="w-full"
			disabled={!hasSelection}
			onClick={onDelete}
		>
			<HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
			{label}
		</Button>
	);
}
