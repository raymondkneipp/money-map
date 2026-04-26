import { BankIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Position, useEdges, useNodes } from "@xyflow/react";
import { useMemo } from "react";
import { edgeAnnualValue, nodeAnnualInflow } from "#/lib/allocation";
import { usd } from "#/lib/format";
import {
	BaseNode,
	BaseNodeContent,
	BaseNodeHeader,
	BaseNodeHeaderTitle,
} from "@/components/base-node";
import { BaseHandle } from "../../base-handle";
import type { CheckingNodeData } from "../types";

export function CheckingNode({
	id,
	data,
}: {
	id: string;
	data: CheckingNodeData["data"];
}) {
	const nodes = useNodes();
	const edges = useEdges();

	const { monthlyIn, monthlyOut, monthlyNet } = useMemo(() => {
		const inAnnual = nodeAnnualInflow(id, nodes, edges);
		const outAnnual = edges
			.filter(
				(e) =>
					e.source === id && (e.type === "allocation" || e.type === "expense"),
			)
			.reduce((acc, e) => acc + edgeAnnualValue(e, nodes, edges), 0);
		return {
			monthlyIn: inAnnual / 12,
			monthlyOut: outAnnual / 12,
			monthlyNet: (inAnnual - outAnnual) / 12,
		};
	}, [id, nodes, edges]);

	const netNegative = monthlyNet < 0;
	const netPositive = monthlyNet > 0;
	const netSign = netNegative ? "−" : netPositive ? "+" : "";
	const netClass = netNegative
		? "text-destructive"
		: netPositive
			? "text-green-600 dark:text-green-400"
			: "";

	return (
		<BaseNode
			className={
				netNegative
					? "w-48 border-destructive bg-destructive/10 in-[.selected]:shadow-destructive/50"
					: "w-48"
			}
		>
			<BaseNodeHeader
				className={netNegative ? "border-b border-destructive" : "border-b"}
			>
				<HugeiconsIcon icon={BankIcon} strokeWidth={2} className="size-4" />
				<BaseNodeHeaderTitle className="font-normal">
					{data.name}
				</BaseNodeHeaderTitle>
			</BaseNodeHeader>
			<BaseNodeContent>
				<div className="flex items-baseline justify-between gap-2">
					<span className="text-xs text-muted-foreground">Balance</span>
					<span className="font-heading font-semibold">
						{usd.format(data.principal)}
					</span>
				</div>
				<div className="flex items-baseline justify-between gap-2">
					<span className="text-xs text-muted-foreground">In</span>
					<span className="font-heading font-semibold">
						{usd.format(monthlyIn)}
						<span className="ml-0.5 text-xs font-normal">/mo</span>
					</span>
				</div>
				<div className="flex items-baseline justify-between gap-2">
					<span className="text-xs text-muted-foreground">Out</span>
					<span className="font-heading font-semibold">
						{usd.format(monthlyOut)}
						<span className="ml-0.5 text-xs font-normal">/mo</span>
					</span>
				</div>
				<div className="flex items-baseline justify-between gap-2">
					<span className="text-xs text-muted-foreground">Net</span>
					<span className={`font-heading font-semibold ${netClass}`}>
						{netSign}
						{usd.format(Math.abs(monthlyNet))}
						<span className="ml-0.5 text-xs font-normal">/mo</span>
					</span>
				</div>
				<div className="flex items-baseline justify-between gap-2">
					<span className="text-xs text-muted-foreground">APY</span>
					<span className="text-sm tabular-nums">{data.apy.toFixed(2)}%</span>
				</div>
				<BaseHandle id="target-1" type="target" position={Position.Left} />
				<BaseHandle id="source-1" type="source" position={Position.Right} />
			</BaseNodeContent>
		</BaseNode>
	);
}
