import { UmbrellaDollarIcon } from "@hugeicons/core-free-icons";
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
import { nodeAnnualInflow } from "../allocation";
import {
	type EmergencyFundNodeData,
	monthlyEssentialOutflow,
} from "../types";

const usd = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 0,
});

export function EmergencyFundNode({
	id,
	data,
}: {
	id: string;
	data: EmergencyFundNodeData["data"];
}) {
	const nodes = useNodes();
	const edges = useEdges();

	const monthlyIn = useMemo(
		() => nodeAnnualInflow(id, nodes, edges) / 12,
		[id, nodes, edges],
	);

	const monthlyNeeded = useMemo(
		() => monthlyEssentialOutflow(nodes),
		[nodes],
	);
	const target = monthlyNeeded * data.targetMonths;
	const monthsCovered = monthlyNeeded > 0 ? data.principal / monthlyNeeded : 0;
	const ratio = target > 0 ? Math.min(1, data.principal / target) : 0;
	const funded = target > 0 && data.principal >= target;

	/**
	 * Months until target is reached, accounting for monthly contributions and
	 * compounding interest. `null` means "never" (no inflow, underfunded) or
	 * "no target". Uses future-value-of-annuity solved for n.
	 */
	const monthsToGoal = useMemo<number | null>(() => {
		if (target <= 0) return null;
		if (data.principal >= target) return 0;
		if (monthlyIn <= 0) return null;
		const r = data.apy / 100 / 12;
		if (r === 0) return (target - data.principal) / monthlyIn;
		const num = target + monthlyIn / r;
		const den = data.principal + monthlyIn / r;
		if (den <= 0 || num / den <= 0) return null;
		return Math.log(num / den) / Math.log(1 + r);
	}, [target, data.principal, data.apy, monthlyIn]);

	return (
		<BaseNode className="w-52 bg-assets border-assets-border in-[.selected]:shadow-assets-border/50">
			<BaseNodeHeader className="border-b border-assets-border">
				<HugeiconsIcon
					icon={UmbrellaDollarIcon}
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
					<span className="font-heading font-semibold">
						{usd.format(data.principal)}
					</span>
				</div>
				<div className="flex items-baseline justify-between gap-2">
					<span className="text-xs text-foreground">Target</span>
					<span className="font-heading font-semibold">
						{usd.format(target)}
						<span className="ml-0.5 text-xs font-normal">
							({data.targetMonths}mo)
						</span>
					</span>
				</div>
				<div className="flex flex-col gap-1">
					<div className="flex items-baseline justify-between gap-2">
						<span className="text-xs text-foreground">Covered</span>
						<span className="text-sm tabular-nums">
							{monthsCovered.toFixed(1)} mo
						</span>
					</div>
					<div className="h-1.5 w-full overflow-hidden rounded-full bg-background/60">
						<div
							className={
								funded
									? "h-full rounded-full bg-green-500"
									: "h-full rounded-full bg-amber-500"
							}
							style={{ width: `${(ratio * 100).toFixed(1)}%` }}
						/>
					</div>
					<div className="flex items-baseline justify-between gap-2">
						<span className="text-xs text-foreground">
							{funded ? "Fully funded" : "Funding"}
						</span>
						<span className="text-xs tabular-nums">
							{(ratio * 100).toFixed(0)}%
						</span>
					</div>
				</div>
				<div className="flex items-baseline justify-between gap-2">
					<span className="text-xs text-foreground">In</span>
					<span className="font-heading font-semibold">
						{usd.format(monthlyIn)}
						<span className="ml-0.5 text-xs font-normal">/mo</span>
					</span>
				</div>
				{!funded && (
					<div className="flex items-baseline justify-between gap-2">
						<span className="text-xs text-foreground">To goal</span>
						<span className="text-sm tabular-nums">
							{monthsToGoal == null
								? "—"
								: monthsToGoal < 12
									? `${monthsToGoal.toFixed(1)} mo`
									: `${(monthsToGoal / 12).toFixed(1)} yr`}
						</span>
					</div>
				)}
				<div className="flex items-baseline justify-between gap-2">
					<span className="text-xs text-foreground">APY</span>
					<span className="text-sm tabular-nums">{data.apy.toFixed(2)}%</span>
				</div>
				<BaseHandle id="target-1" type="target" position={Position.Left} />
			</BaseNodeContent>
		</BaseNode>
	);
}
