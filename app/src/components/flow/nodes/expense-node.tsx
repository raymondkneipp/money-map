import {
	Coffee01Icon,
	Film01Icon,
	HealthIcon,
	Home01Icon,
	More01Icon,
	PlugSocketIcon,
	Shield01Icon,
	ShoppingBag01Icon,
	TaxiIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Position } from "@xyflow/react";
import { usdPrecise } from "#/lib/format";
import {
	BaseNode,
	BaseNodeContent,
	BaseNodeHeader,
	BaseNodeHeaderTitle,
} from "@/components/base-node";
import { BaseHandle } from "../../base-handle";
import { Badge } from "../../ui/badge";
import {
	type ExpenseCategory,
	type ExpenseNodeData,
	FREQUENCY_BY_ID,
} from "../types";

export const CATEGORY_ICON = {
	housing: Home01Icon,
	food: Coffee01Icon,
	transport: TaxiIcon,
	utilities: PlugSocketIcon,
	healthcare: HealthIcon,
	entertainment: Film01Icon,
	insurance: Shield01Icon,
	personal: ShoppingBag01Icon,
	other: More01Icon,
} as const satisfies Record<ExpenseCategory, unknown>;

export function ExpenseNode({
	data,
}: {
	id: string;
	data: ExpenseNodeData["data"];
}) {
	const formatted = usdPrecise.format(data.amount);

	return (
		<BaseNode className="w-48 bg-expenses border-expenses-border in-[.selected]:shadow-expenses-border/50">
			<BaseNodeHeader className="border-b border-expenses-border">
				<HugeiconsIcon
					icon={CATEGORY_ICON[data.category]}
					strokeWidth={2}
					className="size-4"
				/>
				<BaseNodeHeaderTitle className="font-normal">
					{data.name}
				</BaseNodeHeaderTitle>
			</BaseNodeHeader>
			<BaseNodeContent>
				<p className="font-heading font-semibold">
					{formatted}{" "}
					<span className="text-xs font-normal">
						/ {FREQUENCY_BY_ID[data.frequency].abbr}
					</span>
				</p>
				<Badge variant="outline" className="w-fit capitalize">
					{data.category}
				</Badge>
				<BaseHandle id="target-1" type="target" position={Position.Left} />
			</BaseNodeContent>
		</BaseNode>
	);
}
