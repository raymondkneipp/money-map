import { ExpandIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Node } from "@xyflow/react";
import { useEdges, useNodes } from "@xyflow/react";
import { useEffect, useId, useMemo, useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { CryptoCoinId, CryptoNodeData } from "#/components/flow/types";
import {
	buildAxisConfig,
	buildAxisTicks,
	formatAxisTick,
} from "#/lib/chart-axis";
import {
	dateForMonthOffset,
	formatMonthYear,
	startOfThisMonth,
} from "#/lib/dates";
import { usd, usdCompact } from "#/lib/format";
import { projectNodeSeries } from "#/lib/node-projection";
import { buildStats } from "#/lib/node-stats";
import { cn } from "#/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { fetchCoinPrice } from "../crypto-price";

const HORIZONS = [
	{ id: "1y", label: "1Y", months: 12 },
	{ id: "5y", label: "5Y", months: 60 },
	{ id: "10y", label: "10Y", months: 120 },
	{ id: "30y", label: "30Y", months: 360 },
] as const;
type HorizonId = (typeof HORIZONS)[number]["id"];
const DEFAULT_HORIZON: HorizonId = "1y";

function nodeColor(type: string | undefined): string {
	switch (type) {
		case "incomeNode":
			return "var(--color-income-border)";
		case "expenseNode":
			return "var(--color-expenses-border)";
		case "debtNode":
			return "var(--color-debts-border)";
		default:
			return "var(--color-assets-border)";
	}
}

function nodeName(node: Node): string {
	const d = node.data as { name?: string } | undefined;
	return d?.name ?? "Node";
}

export function NodePreviewChart({ node }: { node: Node }) {
	const nodes = useNodes();
	const edges = useEdges();
	const [cryptoPrices, setCryptoPrices] = useState<
		Partial<Record<CryptoCoinId, number>>
	>({});
	const [open, setOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | null>(null);
	const [horizonId, setHorizonId] = useState<HorizonId>(DEFAULT_HORIZON);
	const gradientId = useId();

	useEffect(() => {
		if (node.type !== "cryptoNode") return;
		const coin = (node as CryptoNodeData).data.coin;
		let cancelled = false;
		fetchCoinPrice(coin)
			.then((price) => {
				if (cancelled) return;
				setCryptoPrices((p) => ({ ...p, [coin]: price }));
			})
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [node]);

	const horizonMonths = HORIZONS.find((h) => h.id === horizonId)?.months ?? 12;

	const series = useMemo(
		() => projectNodeSeries(node, nodes, edges, cryptoPrices, horizonMonths),
		[node, nodes, edges, cryptoPrices, horizonMonths],
	);

	const today = useMemo(() => startOfThisMonth(), []);

	const xConfig = useMemo(
		() => buildAxisConfig(horizonMonths),
		[horizonMonths],
	);
	const xTicks = useMemo(
		() => buildAxisTicks(horizonMonths, xConfig.step),
		[horizonMonths, xConfig.step],
	);

	const stats = useMemo(
		() => buildStats(node, nodes, edges, cryptoPrices, series, today),
		[node, nodes, edges, cryptoPrices, series, today],
	);

	if (series.points.length === 0) return null;

	const color = nodeColor(node.type);
	const lineType = series.stepped ? "stepAfter" : "monotone";
	const colorStyle = { "--node-chart-color": color } as React.CSSProperties;

	const lastIdx = series.points.length - 1;
	const activeIdx = hoverIdx ?? lastIdx;
	const activePoint = series.points[activeIdx] ?? series.points[lastIdx];

	const xTickFormatter = (m: number | string) =>
		formatAxisTick(m, today, xConfig);

	return (
		<>
			<div style={colorStyle}>
				<div className="relative h-32 w-full bg-muted/20">
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						className="absolute left-1 top-1 z-10"
						onClick={() => setOpen(true)}
						aria-label="Expand chart"
					>
						<HugeiconsIcon icon={ExpandIcon} strokeWidth={2} />
					</Button>
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart
							data={series.points}
							margin={{ top: 6, right: 0, left: 0, bottom: 0 }}
							onMouseMove={(s) => {
								if (typeof s?.activeTooltipIndex === "number") {
									setHoverIdx(s.activeTooltipIndex);
								}
							}}
							onMouseLeave={() => setHoverIdx(null)}
						>
							<defs>
								<linearGradient
									id={`fill-${gradientId}`}
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop
										offset="0%"
										stopColor="var(--node-chart-color)"
										stopOpacity={0.45}
									/>
									<stop
										offset="100%"
										stopColor="var(--node-chart-color)"
										stopOpacity={0.05}
									/>
								</linearGradient>
							</defs>
							<Tooltip
								cursor={false}
								content={() => null}
								isAnimationActive={false}
							/>
							<Area
								type={lineType}
								dataKey="value"
								stroke="var(--node-chart-color)"
								strokeWidth={1.75}
								fill={`url(#fill-${gradientId})`}
								dot={false}
								activeDot={{
									r: 3.5,
									fill: "var(--node-chart-color)",
									stroke: "var(--background)",
									strokeWidth: 1.5,
								}}
								isAnimationActive={false}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
				<div className="flex items-center justify-between gap-3 border-t border-border bg-background px-4 py-2 text-xs">
					<span className="flex items-center gap-2 text-muted-foreground">
						<span
							className="size-2 shrink-0 rounded-[2px]"
							style={{ background: color }}
						/>
						<span className="truncate">{series.label}</span>
					</span>
					<span className="font-mono font-medium tabular-nums">
						{usd.format(activePoint.readout ?? activePoint.value)}
					</span>
				</div>
				<HorizonTabs value={horizonId} onChange={setHorizonId} />
			</div>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent
					className="max-h-[90vh] max-w-[min(95vw,72rem)] overflow-y-auto sm:max-w-[min(95vw,72rem)]"
					style={colorStyle}
				>
					<DialogHeader>
						<DialogTitle>{nodeName(node)}</DialogTitle>
						<DialogDescription>{series.label}</DialogDescription>
					</DialogHeader>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
						{stats.map((s) => (
							<div
								key={s.label}
								className="rounded-md border border-border bg-muted/30 px-3 py-2"
							>
								<div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
									{s.label}
								</div>
								<div className="mt-0.5 truncate font-mono text-sm font-medium tabular-nums">
									{s.value}
								</div>
							</div>
						))}
					</div>
					<div className="h-[60vh] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart
								data={series.points}
								margin={{ top: 16, right: 16, left: 8, bottom: 8 }}
							>
								<defs>
									<linearGradient
										id={`fill-lg-${gradientId}`}
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop
											offset="0%"
											stopColor="var(--node-chart-color)"
											stopOpacity={0.45}
										/>
										<stop
											offset="100%"
											stopColor="var(--node-chart-color)"
											stopOpacity={0.05}
										/>
									</linearGradient>
								</defs>
								<CartesianGrid vertical={false} stroke="var(--border)" />
								<XAxis
									dataKey="month"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									ticks={xTicks}
									tickFormatter={xTickFormatter}
								/>
								<YAxis
									tickLine={false}
									axisLine={false}
									width={64}
									tickFormatter={(v) => usdCompact.format(Number(v))}
								/>
								<Tooltip
									cursor={{ stroke: "var(--border)" }}
									content={
										<DialogTooltip
											color={color}
											label={series.label}
											today={today}
										/>
									}
								/>
								<Area
									type={lineType}
									dataKey="value"
									stroke="var(--node-chart-color)"
									strokeWidth={2}
									fill={`url(#fill-lg-${gradientId})`}
									dot={false}
									activeDot={{
										r: 4,
										fill: "var(--node-chart-color)",
										stroke: "var(--background)",
										strokeWidth: 2,
									}}
									isAnimationActive={false}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
					<div className="flex justify-end">
						<HorizonTabs value={horizonId} onChange={setHorizonId} inline />
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

function HorizonTabs({
	value,
	onChange,
	inline = false,
}: {
	value: HorizonId;
	onChange: (id: HorizonId) => void;
	inline?: boolean;
}) {
	return (
		<div
			role="tablist"
			aria-label="Time range"
			className={cn(
				"flex items-center gap-1 bg-background py-1",
				inline
					? "rounded-md border border-border px-1"
					: "justify-center border-y border-border px-2",
			)}
		>
			{HORIZONS.map((h) => {
				const active = h.id === value;
				return (
					<button
						key={h.id}
						type="button"
						role="tab"
						aria-selected={active}
						onClick={() => onChange(h.id)}
						className={cn(
							"rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide transition-colors",
							active
								? "bg-muted text-foreground"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						{h.label}
					</button>
				);
			})}
		</div>
	);
}

function DialogTooltip({
	active,
	payload,
	color,
	label,
	today,
}: {
	active?: boolean;
	payload?: Array<{
		value?: number | string;
		payload?: { month?: number; value?: number; readout?: number };
	}>;
	color: string;
	label: string;
	today: Date;
}) {
	if (!active || !payload || payload.length === 0) return null;
	const p = payload[0];
	const month = Number(p.payload?.month ?? 0);
	const shown = p.payload?.readout ?? Number(p.value ?? 0);
	return (
		<div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-sm">
			<div className="mb-0.5 font-medium">
				{formatMonthYear(dateForMonthOffset(today, month))}
			</div>
			<div className="flex items-center gap-2">
				<span className="size-2 rounded-[2px]" style={{ background: color }} />
				<span className="text-muted-foreground">{label}</span>
				<span className="ml-auto font-mono tabular-nums">
					{usd.format(shown)}
				</span>
			</div>
		</div>
	);
}
