import {
	AnalyticsUpIcon,
	CubeIcon,
	Leaf01Icon,
} from "@hugeicons/core-free-icons";
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
import type { AssetNodeData, AssetType } from "../types";

export const ASSET_TYPE_ICON = {
	ira: Leaf01Icon,
	brokerage: AnalyticsUpIcon,
	other: CubeIcon,
} as const satisfies Record<AssetType, unknown>;

export function AssetNode({
	id,
	data,
}: {
	id: string;
	data: AssetNodeData["data"];
}) {
	const nodes = useNodes();
	const edges = useEdges();

	const monthlyIn = useMemo(
		() => nodeAnnualInflow(id, nodes, edges) / 12,
		[id, nodes, edges],
	);

	return (
		<BaseNode className="w-48 bg-assets border-assets-border in-[.selected]:shadow-assets-border/50">
			<BaseNodeHeader className="border-b border-assets-border">
				<HugeiconsIcon
					icon={ASSET_TYPE_ICON[data.assetType]}
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
					<span className="text-xs text-foreground">In</span>
					<span className="font-heading font-semibold">
						{usd.format(monthlyIn)}
						<span className="ml-0.5 text-xs font-normal">/mo</span>
					</span>
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
