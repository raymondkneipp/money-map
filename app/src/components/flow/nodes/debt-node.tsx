import {
	AlertCircleIcon,
	Car01Icon,
	CreditCardIcon,
	Home01Icon,
	More01Icon,
	MortarboardIcon,
	StethoscopeIcon,
	UserCheck01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Position, useEdges, useNodes } from "@xyflow/react";
import { useMemo } from "react";
import { nodeAnnualInflow } from "#/lib/allocation";
import { debtStatus, formatPayoff } from "#/lib/debt";
import { usd } from "#/lib/format";
import {
	BaseNode,
	BaseNodeContent,
	BaseNodeHeader,
	BaseNodeHeaderTitle,
} from "@/components/base-node";
import { BaseHandle } from "../../base-handle";
import { Badge } from "../../ui/badge";
import { type DebtNodeData, type DebtType, toAnnual } from "../types";

export const DEBT_TYPE_ICON = {
	creditCard: CreditCardIcon,
	studentLoan: MortarboardIcon,
	autoLoan: Car01Icon,
	mortgage: Home01Icon,
	personalLoan: UserCheck01Icon,
	medical: StethoscopeIcon,
	other: More01Icon,
} as const satisfies Record<DebtType, unknown>;

export function DebtNode({
	id,
	data,
}: {
	id: string;
	data: DebtNodeData["data"];
}) {
	const nodes = useNodes();
	const edges = useEdges();

	const status = useMemo(() => {
		const monthlyPayment = nodeAnnualInflow(id, nodes, edges) / 12;
		const monthlyMinimum =
			toAnnual(data.minimumPayment, data.minimumFrequency) / 12;
		return debtStatus(data.principal, data.apr, monthlyPayment, monthlyMinimum);
	}, [
		id,
		nodes,
		edges,
		data.principal,
		data.apr,
		data.minimumPayment,
		data.minimumFrequency,
	]);

	// Status drives both the bottom-row display and the card border accent.
	const isError = status.kind === "underwater";
	const isWarning =
		status.kind === "below-minimum" || status.kind === "no-payment";

	return (
		<BaseNode
			className={[
				"w-52 bg-debts border-debts-border in-[.selected]:shadow-debts-border/50",
				isError && "ring-2 ring-destructive/60",
				isWarning && "ring-2 ring-amber-500/60",
			]
				.filter(Boolean)
				.join(" ")}
		>
			<BaseNodeHeader className="border-b border-debts-border">
				<HugeiconsIcon
					icon={DEBT_TYPE_ICON[data.debtType]}
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
				<div className="flex items-baseline justify-between gap-2">
					<span className="text-xs text-foreground">APR</span>
					<span className="text-sm tabular-nums">{data.apr.toFixed(2)}%</span>
				</div>
				<div className="flex items-baseline justify-between gap-2">
					<span className="text-xs text-foreground">Payment</span>
					<span className="text-sm font-medium tabular-nums">
						{usd.format(
							status.kind === "no-payment" ? 0 : status.monthlyPayment,
						)}
						<span className="ml-0.5 text-xs font-normal">/mo</span>
					</span>
				</div>
				<DebtStatusRow status={status} />
				<BaseHandle id="target-1" type="target" position={Position.Left} />
			</BaseNodeContent>
		</BaseNode>
	);
}

function DebtStatusRow({ status }: { status: ReturnType<typeof debtStatus> }) {
	if (status.kind === "healthy") {
		return (
			<div className="flex items-baseline justify-between gap-2">
				<span className="text-xs text-foreground">Payoff</span>
				<span className="text-sm font-medium tabular-nums text-green-600 dark:text-green-400">
					{formatPayoff(status.payoffMonths)}
				</span>
			</div>
		);
	}
	if (status.kind === "below-minimum") {
		return (
			<Badge
				variant="outline"
				className="w-fit gap-1 border-amber-500/60 text-amber-700 dark:text-amber-400"
			>
				<HugeiconsIcon
					icon={AlertCircleIcon}
					strokeWidth={2}
					className="size-3"
				/>
				Below minimum ({usd.format(status.shortfall)}/mo short)
			</Badge>
		);
	}
	if (status.kind === "underwater") {
		return (
			<Badge variant="destructive" className="w-fit gap-1">
				<HugeiconsIcon
					icon={AlertCircleIcon}
					strokeWidth={2}
					className="size-3"
				/>
				Never pays off
			</Badge>
		);
	}
	// no-payment
	return (
		<Badge
			variant="outline"
			className="w-fit gap-1 border-amber-500/60 text-amber-700 dark:text-amber-400"
		>
			<HugeiconsIcon
				icon={AlertCircleIcon}
				strokeWidth={2}
				className="size-3"
			/>
			No payment
		</Badge>
	);
}
