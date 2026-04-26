import { RockingChairIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Position, useEdges, useNodes } from "@xyflow/react";
import { useMemo } from "react";
import { nodeAnnualInflow } from "#/lib/allocation";
import { usd } from "#/lib/format";
import {
	BaseNode,
	BaseNodeContent,
	BaseNodeHeader,
	BaseNodeHeaderTitle,
} from "@/components/base-node";
import { BaseHandle } from "../../base-handle";
import type { RetirementNodeData } from "../types";

export function RetirementNode({
	id,
	data,
}: {
	id: string;
	data: RetirementNodeData["data"];
}) {
	const nodes = useNodes();
	const edges = useEdges();

	const { employeeMonthly, matchMonthly, totalMonthly } = useMemo(() => {
		// totalAnnual is already grossed up by employer match in nodeAnnualInflow;
		// back out the employee portion so we can show the split.
		const totalAnnual = nodeAnnualInflow(id, nodes, edges);
		const employeeAnnual = totalAnnual / (1 + data.employerMatch / 100);
		const matchAnnual = totalAnnual - employeeAnnual;
		return {
			employeeMonthly: employeeAnnual / 12,
			matchMonthly: matchAnnual / 12,
			totalMonthly: totalAnnual / 12,
		};
	}, [id, nodes, edges, data.employerMatch]);

	return (
		<BaseNode className="w-52 bg-assets border-assets-border in-[.selected]:shadow-assets-border/50">
			<BaseNodeHeader className="border-b border-assets-border">
				<HugeiconsIcon
					icon={RockingChairIcon}
					strokeWidth={2}
					className="size-4"
				/>
				<BaseNodeHeaderTitle className="font-normal">
					{data.name}
				</BaseNodeHeaderTitle>
			</BaseNodeHeader>
			<BaseNodeContent>
				<div className="flex items-baseline justify-between gap-2">
					<span className="text-xs text-foreground">Balance</span>
					<span className="font-heading font-semibold tabular-nums">
						{usd.format(data.principal)}
					</span>
				</div>
				<div className="border-t border-assets-border/30 pt-1">
					<div className="flex items-baseline justify-between gap-2">
						<span className="text-xs text-foreground">Contribution</span>
						<span className="text-sm font-medium tabular-nums">
							{usd.format(employeeMonthly)}
							<span className="ml-0.5 text-xs font-normal">/mo</span>
						</span>
					</div>
					<div className="flex items-baseline justify-between gap-2">
						<span className="text-xs text-foreground">
							Match ({data.employerMatch.toFixed(0)}%)
						</span>
						<span className="text-sm font-medium tabular-nums text-green-600 dark:text-green-400">
							+{usd.format(matchMonthly)}
							<span className="ml-0.5 text-xs font-normal">/mo</span>
						</span>
					</div>
					<div className="mt-1 flex items-baseline justify-between gap-2 border-t border-assets-border/20 pt-1">
						<span className="text-xs font-semibold">Total In</span>
						<span className="font-heading font-semibold tabular-nums">
							{usd.format(totalMonthly)}
							<span className="ml-0.5 text-xs font-normal">/mo</span>
						</span>
					</div>
				</div>
				<div className="flex items-baseline justify-between gap-2">
					<span className="text-xs text-foreground">Return</span>
					<span className="text-sm tabular-nums">{data.apy.toFixed(2)}%</span>
				</div>
				<BaseHandle id="target-1" type="target" position={Position.Left} />
			</BaseNodeContent>
		</BaseNode>
	);
}
