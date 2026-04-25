import {
	AnalyticsUpIcon,
	BankIcon,
	BitcoinCircleIcon,
	CubeIcon,
	FullscreenIcon,
	Leaf01Icon,
	Money01Icon,
	PiggyBankIcon,
	PlusSignIcon,
	RockingChairIcon,
	SearchAddIcon,
	SearchMinusIcon,
	ShoppingBag01Icon,
	SquareLock01Icon,
	SquareUnlock01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type Node, Panel, useReactFlow } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

type NodeKind =
	| "incomeNode"
	| "checkingNode"
	| "savingsNode"
	| "expenseNode"
	| "cryptoNode"
	| "retirementNode"
	| "iraNode"
	| "brokerageNode"
	| "otherAssetNode";

const ASSET_KINDS = new Set<NodeKind>([
	"savingsNode",
	"cryptoNode",
	"retirementNode",
	"iraNode",
	"brokerageNode",
	"otherAssetNode",
]);

const NODE_PRESETS: Array<{
	kind: NodeKind;
	label: string;
	icon: typeof Money01Icon;
	iconColor?: string;
	data: Record<string, unknown>;
}> = [
	{
		kind: "incomeNode",
		label: "Income",
		icon: Money01Icon,
		iconColor: "var(--color-green-500)",
		data: {
			name: "New income",
			amount: 1000,
			frequency: "monthly",
			passive: false,
		},
	},
	{
		kind: "checkingNode",
		label: "Checking",
		icon: BankIcon,
		data: { name: "Checking", principal: 0, apy: 0 },
	},
	{
		kind: "savingsNode",
		label: "Savings",
		icon: PiggyBankIcon,
		iconColor: "var(--color-blue-500)",
		data: { name: "Savings", principal: 0, apy: 4 },
	},
	{
		kind: "expenseNode",
		label: "Expense",
		icon: ShoppingBag01Icon,
		iconColor: "var(--color-amber-500)",
		data: {
			name: "New expense",
			amount: 100,
			frequency: "monthly",
			category: "other",
		},
	},
	{
		kind: "cryptoNode",
		label: "Crypto",
		icon: BitcoinCircleIcon,
		iconColor: "var(--color-blue-500)",
		data: {
			name: "BTC",
			coin: "bitcoin",
			principal: 0,
			growthProfile: "moderate",
		},
	},
	{
		kind: "retirementNode",
		label: "401(k)",
		icon: RockingChairIcon,
		iconColor: "var(--color-blue-500)",
		data: {
			name: "401(k)",
			principal: 0,
			apy: 7,
			employerMatch: 50,
		},
	},
	{
		kind: "iraNode",
		label: "IRA / Roth IRA",
		icon: Leaf01Icon,
		iconColor: "var(--color-blue-500)",
		data: { name: "Roth IRA", principal: 0, apy: 7 },
	},
	{
		kind: "brokerageNode",
		label: "Brokerage",
		icon: AnalyticsUpIcon,
		iconColor: "var(--color-blue-500)",
		data: { name: "Brokerage", principal: 0, apy: 8 },
	},
	{
		kind: "otherAssetNode",
		label: "Other",
		icon: CubeIcon,
		iconColor: "var(--color-blue-500)",
		data: { name: "Asset", principal: 0, apy: 0 },
	},
];

export function FlowToolbar({
	interactive,
	onInteractiveChange,
}: {
	interactive: boolean;
	onInteractiveChange: (next: boolean) => void;
}) {
	const {
		zoomIn,
		zoomOut,
		fitView,
		addNodes,
		setNodes,
		setEdges,
		screenToFlowPosition,
	} = useReactFlow();

	const onAdd = (preset: (typeof NODE_PRESETS)[number]) => {
		const position = screenToFlowPosition({
			x: window.innerWidth / 2,
			y: window.innerHeight / 2,
		});
		const node: Node = {
			id: `${preset.kind}-${Date.now()}`,
			type: preset.kind,
			position,
			data: preset.data,
			selected: true,
		};
		// deselect everything else so the new node is the sole selection
		setNodes((ns) =>
			ns.map((n) => (n.selected ? { ...n, selected: false } : n)),
		);
		setEdges((es) =>
			es.map((e) => (e.selected ? { ...e, selected: false } : e)),
		);
		addNodes(node);
	};

	return (
		<Panel position="bottom-center">
			<div className="flex items-center gap-1 rounded-md border border-border bg-background p-1 shadow-sm">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => zoomIn()}
					aria-label="Zoom in"
				>
					<HugeiconsIcon icon={SearchAddIcon} strokeWidth={2} />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => zoomOut()}
					aria-label="Zoom out"
				>
					<HugeiconsIcon icon={SearchMinusIcon} strokeWidth={2} />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => fitView({ padding: 0.1 })}
					aria-label="Fit view"
				>
					<HugeiconsIcon icon={FullscreenIcon} strokeWidth={2} />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => onInteractiveChange(!interactive)}
					aria-label={interactive ? "Lock canvas" : "Unlock canvas"}
					aria-pressed={!interactive}
				>
					<HugeiconsIcon
						icon={interactive ? SquareUnlock01Icon : SquareLock01Icon}
						strokeWidth={2}
					/>
				</Button>
				<Separator orientation="vertical" className="mx-1" />
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" aria-label="Add node">
							<HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
							<span>Add node</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="center" side="top">
						{NODE_PRESETS.filter((p) => !ASSET_KINDS.has(p.kind)).map(
							(preset) => (
								<DropdownMenuItem
									key={preset.kind}
									onSelect={() => onAdd(preset)}
								>
									<HugeiconsIcon
										icon={preset.icon}
										strokeWidth={2}
										style={
											preset.iconColor ? { color: preset.iconColor } : undefined
										}
									/>
									<span>{preset.label}</span>
								</DropdownMenuItem>
							),
						)}
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>
								<HugeiconsIcon
									icon={PiggyBankIcon}
									strokeWidth={2}
									style={{ color: "var(--color-blue-500)" }}
								/>
								<span>Assets</span>
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent>
								{NODE_PRESETS.filter((p) => ASSET_KINDS.has(p.kind)).map(
									(preset) => (
										<DropdownMenuItem
											key={preset.kind}
											onSelect={() => onAdd(preset)}
										>
											<HugeiconsIcon
												icon={preset.icon}
												strokeWidth={2}
												style={
													preset.iconColor
														? { color: preset.iconColor }
														: undefined
												}
											/>
											<span>{preset.label}</span>
										</DropdownMenuItem>
									),
								)}
							</DropdownMenuSubContent>
						</DropdownMenuSub>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</Panel>
	);
}
