import { Alert02Icon, BankIcon } from "@hugeicons/core-free-icons";
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
import { computeNodeUtilization, edgeAnnualValue } from "../allocation";
import type { CheckingNodeData } from "../types";

const usd = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 0,
});

export function CheckingNode({
	id,
	data,
}: {
	id: string;
	data: CheckingNodeData["data"];
}) {
	const nodes = useNodes();
	const edges = useEdges();

	const { monthlyIn, monthlyOut, over } = useMemo(() => {
		const util = computeNodeUtilization(id, nodes, edges);
		// Uncapped sum of outgoing edges — shows the *attempted* spend even
		// when it exceeds inflow, so the user sees the real commitment.
		const requestedAnnual = edges
			.filter(
				(e) =>
					e.source === id && (e.type === "allocation" || e.type === "expense"),
			)
			.reduce((acc, e) => acc + edgeAnnualValue(e, nodes, edges), 0);
		return {
			monthlyIn: util.totalAnnual / 12,
			monthlyOut: requestedAnnual / 12,
			over: util.over,
		};
	}, [id, nodes, edges]);

	return (
		<BaseNode
			className={
				over
					? "w-48 border-destructive bg-destructive/10 in-[.selected]:shadow-destructive/50"
					: "w-48"
			}
		>
			<BaseNodeHeader
				className={over ? "border-b border-destructive" : "border-b"}
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
					<span
						className={`text-xs ${
							over ? "text-destructive font-medium" : "text-muted-foreground"
						}`}
					>
						Out
					</span>
					<span
						className={`font-heading font-semibold inline-flex items-center gap-1 ${
							over ? "text-destructive" : ""
						}`}
					>
						{over && (
							<HugeiconsIcon
								icon={Alert02Icon}
								strokeWidth={2}
								className="size-3.5"
							/>
						)}
						{usd.format(monthlyOut)}
						<span className="ml-0.5 text-xs font-normal">/mo</span>
					</span>
				</div>
				<div className="flex items-baseline justify-between gap-2">
					<span className="text-xs text-muted-foreground">APY</span>
					<span className="text-sm tabular-nums">{data.apy.toFixed(2)}%</span>
				</div>
				{over && (
					<p className="text-xs text-destructive">
						Outflow exceeds inflow by {usd.format(monthlyOut - monthlyIn)}/mo
					</p>
				)}
				<BaseHandle id="target-1" type="target" position={Position.Left} />
				<BaseHandle id="source-1" type="source" position={Position.Right} />
			</BaseNodeContent>
		</BaseNode>
	);
}
