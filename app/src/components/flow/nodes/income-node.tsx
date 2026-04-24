import { Alert02Icon, Money01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Position, useEdges, useNodes } from "@xyflow/react";
import { useMemo } from "react";
import {
	BaseNode,
	BaseNodeContent,
	BaseNodeHeader,
	BaseNodeHeaderTitle,
} from "@/components/base-node";
import { BaseHandle } from "../../base-handle";
import { Badge } from "../../ui/badge";
import { computeNodeUtilization, formatAnnualAs } from "../allocation";
import { FREQUENCY_BY_ID, type IncomeNodeData } from "../types";

export function IncomeNode({
	id,
	data,
}: {
	id: string;
	data: IncomeNodeData["data"];
}) {
	const nodes = useNodes();
	const edges = useEdges();
	const formatted = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(data.amount);

	const utilization = useMemo(
		() => computeNodeUtilization(id, nodes, edges),
		[id, nodes, edges],
	);

	const unallocatedLabel =
		utilization.unallocatedAnnual > 0
			? formatAnnualAs(utilization.unallocatedAnnual, data.frequency)
			: null;

	return (
		<BaseNode
			className={`w-48 bg-income border-income-border in-[.selected]:shadow-income-border/50 ${
				utilization.over
					? "border-destructive bg-destructive/10 in-[.selected]:shadow-destructive/50"
					: ""
			}`}
		>
			<BaseNodeHeader
				className={`border-b ${
					utilization.over ? "border-destructive" : "border-income-border"
				}`}
			>
				<HugeiconsIcon icon={Money01Icon} strokeWidth={2} className="size-4" />
				<BaseNodeHeaderTitle>{data.name}</BaseNodeHeaderTitle>
				{data.passive && <Badge variant="outline">Passive</Badge>}
			</BaseNodeHeader>
			<BaseNodeContent>
				<p className="font-heading font-semibold">
					{formatted}{" "}
					<span className="text-xs font-normal">
						/ {FREQUENCY_BY_ID[data.frequency].abbr}
					</span>
				</p>

				{utilization.over && (
					<Badge variant="destructive" className="gap-1">
						<HugeiconsIcon
							icon={Alert02Icon}
							strokeWidth={2}
							className="size-3"
						/>
						Over-allocated
					</Badge>
				)}
				{!utilization.over && unallocatedLabel && (
					<Badge
						variant="outline"
						className="border-amber-500 text-amber-700 dark:text-amber-300"
					>
						{unallocatedLabel} unallocated
					</Badge>
				)}

				<BaseHandle id="source-1" type="source" position={Position.Right} />
			</BaseNodeContent>
		</BaseNode>
	);
}
