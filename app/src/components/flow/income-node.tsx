import { Money01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Position } from "@xyflow/react";
import {
	BaseNode,
	BaseNodeContent,
	BaseNodeHeader,
	BaseNodeHeaderTitle,
} from "@/components/base-node";
import { BaseHandle } from "../base-handle";
import { FREQUENCY_BY_ID, type IncomeNodeData } from "./types";
import { Badge } from "../ui/badge";

export function IncomeNode({
	data,
}: {
	id: string;
	data: IncomeNodeData["data"];
}) {
	const formatted = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(data.amount);

	return (
		<BaseNode className="w-48 dark:bg-green-900 dark:border-green-600 bg-green-200 border-green-400 in-[.selected]:shadow-green-400/50 dark:in-[.selected]:border-green-600/50">
			<BaseNodeHeader className="border-b dark:border-green-600 border-green-400">
				<HugeiconsIcon icon={Money01Icon} strokeWidth={2} className="size-4" />
				<BaseNodeHeaderTitle className="font-normal">
					{data.name}
				</BaseNodeHeaderTitle>
				{data.passive && <Badge variant="outline">Passive</Badge>}
			</BaseNodeHeader>
			<BaseNodeContent>
				<p className="font-heading font-semibold">
					{formatted}{" "}
					<span className="text-xs font-normal">
						/ {FREQUENCY_BY_ID[data.frequency].abbr}
					</span>
				</p>

				<BaseHandle id="source-1" type="source" position={Position.Right} />
			</BaseNodeContent>
		</BaseNode>
	);
}
