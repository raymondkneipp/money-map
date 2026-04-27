import { Calendar01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Line,
	LineChart,
	Legend as RechartsLegend,
	ReferenceLine,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { fetchCoinPrice } from "#/components/flow/crypto-price";
import { useFlowState } from "#/components/flow/flow-state";
import type { CryptoCoinId } from "#/components/flow/types";
import { formatISODate, parseISODate } from "#/lib/dates";
import { usd, usdCompact } from "#/lib/format";
import {
	DEFAULT_ASSUMPTIONS,
	type ProjectionAssumptions,
	runProjection,
} from "#/lib/projections";
import { uniqueCryptoCoins } from "#/lib/stats";
import { loadJSON, saveJSON } from "#/lib/storage";
import { cn } from "#/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const Route = createFileRoute("/app/projections")({
	component: ProjectionsPage,
	head: () => ({ meta: [{ title: "Projections · Money Map" }] }),
});

const ASSUMPTIONS_STORAGE_KEY = "money-map:projection-assumptions:v1";

function ProjectionsPage() {
	const { nodes, edges } = useFlowState();
	const [cryptoPrices, setCryptoPrices] = useState<
		Partial<Record<CryptoCoinId, number>>
	>({});

	const coins = useMemo(() => uniqueCryptoCoins(nodes), [nodes]);
	useEffect(() => {
		let cancelled = false;
		(async () => {
			const entries = await Promise.all(
				coins.map(async (id) => [id, await fetchCoinPrice(id)] as const),
			);
			if (cancelled) return;
			setCryptoPrices(Object.fromEntries(entries));
		})().catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [coins]);

	const [assumptions, setAssumptions] =
		useState<ProjectionAssumptions>(DEFAULT_ASSUMPTIONS);
	const [hydrated, setHydrated] = useState(false);

	// Load saved assumptions on mount. Done after first render to avoid SSR
	// hydration mismatch with localStorage-derived values.
	useEffect(() => {
		const saved = loadJSON<Partial<ProjectionAssumptions>>(
			ASSUMPTIONS_STORAGE_KEY,
		);
		if (saved) setAssumptions((a) => ({ ...a, ...saved }));
		setHydrated(true);
	}, []);

	useEffect(() => {
		if (!hydrated) return;
		saveJSON(ASSUMPTIONS_STORAGE_KEY, assumptions);
	}, [assumptions, hydrated]);

	const result = useMemo(
		() => runProjection(nodes, edges, assumptions, cryptoPrices),
		[nodes, edges, assumptions, cryptoPrices],
	);

	const chartConfig: ChartConfig = {
		nominal: { label: "Net worth (nominal)", color: "var(--chart-1)" },
		real: { label: "Net worth (today's $)", color: "var(--chart-2)" },
		fiTarget: { label: "FI target", color: "var(--chart-4)" },
	};

	const update = <K extends keyof ProjectionAssumptions>(
		key: K,
		value: ProjectionAssumptions[K],
	) => setAssumptions((a) => ({ ...a, [key]: value }));

	return (
		<div className="flex min-h-svh flex-col">
			<header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
				<SidebarTrigger variant="secondary" size="icon-lg" />
				<h1 className="font-heading text-lg font-medium">Projections</h1>
			</header>

			<main className="flex-1 space-y-6 px-6 py-6">
				<section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					<MetricCard
						label="Current age"
						value={`${result.currentAge}`}
						hint={`Born ${assumptions.birthDate}`}
					/>
					<MetricCard
						label="Years to retirement"
						value={`${result.yearsToRetirement}`}
						hint={`Target age ${assumptions.retirementAge}`}
					/>
					<MetricCard
						label={`Net worth at ${assumptions.retirementAge}`}
						value={
							result.atRetirement
								? usd.format(result.atRetirement.nominal)
								: "—"
						}
						hint={
							result.atRetirement
								? `${usd.format(result.atRetirement.real)} in today's $`
								: "Already past target age"
						}
						tone="positive"
					/>
					<MetricCard
						label="Early retirement age"
						value={
							result.earlyRetirementAge !== null
								? `${result.earlyRetirementAge}`
								: "—"
						}
						hint={
							result.earlyRetirementAge !== null
								? `When real net worth ≥ ${usd.format(result.fiNumber)} (${assumptions.safeWithdrawalPct}% rule)`
								: result.fiNumber > 0
									? `Won't reach ${usd.format(result.fiNumber)} within projection horizon`
									: "Add expenses to compute FI target"
						}
						tone={result.earlyRetirementAge !== null ? "positive" : "neutral"}
					/>
				</section>

				<section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					<MetricCard
						label="Starting net worth"
						value={usd.format(result.startingNetWorth)}
						hint="Assets − debt today"
						tone={result.startingNetWorth >= 0 ? "positive" : "negative"}
					/>
					<MetricCard
						label="FI number"
						value={result.fiNumber > 0 ? usd.format(result.fiNumber) : "—"}
						hint={`${assumptions.safeWithdrawalPct}% rule on ${usd.format(result.currentAnnualExpenses)}/yr expenses`}
					/>
					<MetricCard
						label="Retirement income"
						value={
							result.retirementIncomeReal > 0
								? `${usd.format(result.retirementIncomeReal)}/yr`
								: "—"
						}
						hint={
							result.retirementIncomeNominal > 0
								? `${usd.format(result.retirementIncomeNominal)}/yr nominal at age ${assumptions.retirementAge}`
								: "Today's $, drawing 4%"
						}
						tone="positive"
					/>
					<MetricCard
						label="Annual expenses"
						value={usd.format(result.currentAnnualExpenses)}
						hint={`${usd.format(result.currentMonthlyExpenses)}/mo today`}
					/>
				</section>

				<section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
					<Card className="lg:col-span-1">
						<CardHeader>
							<CardTitle>Assumptions</CardTitle>
							<CardDescription>
								Edit any value to update the projection
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<Field label="Birth date">
								<BirthDatePicker
									value={assumptions.birthDate}
									onChange={(v) => update("birthDate", v)}
								/>
							</Field>
							<Field label="Retirement age">
								<Input
									type="number"
									inputMode="numeric"
									min={1}
									max={120}
									value={assumptions.retirementAge}
									onChange={(e) =>
										update("retirementAge", numberOr(e.target.value, 67))
									}
								/>
							</Field>
							<Field label="Inflation (%)">
								<Input
									type="number"
									step="0.1"
									value={assumptions.inflationPct}
									onChange={(e) =>
										update("inflationPct", numberOr(e.target.value, 3))
									}
								/>
							</Field>
							<Field label="Safe withdrawal rate (%)">
								<Input
									type="number"
									step="0.1"
									value={assumptions.safeWithdrawalPct}
									onChange={(e) =>
										update("safeWithdrawalPct", numberOr(e.target.value, 4))
									}
								/>
							</Field>
							<div className="rounded-md border border-border/60 bg-muted/30 p-2 text-[11px] text-muted-foreground">
								<div className="mb-1 font-medium text-foreground">
									Derived from your flow
								</div>
								<div className="flex justify-between">
									<span>Blended return</span>
									<span className="font-mono tabular-nums">
										{result.blendedReturnPct.toFixed(2)}%
									</span>
								</div>
								<div className="flex justify-between">
									<span>Annual contributions</span>
									<span className="font-mono tabular-nums">
										{usd.format(result.totalAnnualContribution)}
									</span>
								</div>
								<p className="mt-1 leading-snug">
									Each asset grows at its own rate (APY on cash/savings/IRA/
									brokerage, growth profile on crypto). Edit the underlying
									nodes to change these.
								</p>
							</div>
						</CardContent>
					</Card>

					<Card className="lg:col-span-2">
						<CardHeader>
							<CardTitle>Net worth projection</CardTitle>
							<CardDescription>
								Nominal vs. inflation-adjusted (today's $) growth through age{" "}
								{result.series[result.series.length - 1]?.age ?? "—"}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ChartContainer config={chartConfig} className="h-[320px] w-full">
								<AreaChart
									data={result.series}
									margin={{ left: 8, right: 16, top: 24, bottom: 0 }}
								>
									<defs>
										<linearGradient
											id="fillNominal"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop
												offset="5%"
												stopColor="var(--color-nominal)"
												stopOpacity={0.45}
											/>
											<stop
												offset="95%"
												stopColor="var(--color-nominal)"
												stopOpacity={0.05}
											/>
										</linearGradient>
										<linearGradient id="fillReal" x1="0" y1="0" x2="0" y2="1">
											<stop
												offset="5%"
												stopColor="var(--color-real)"
												stopOpacity={0.45}
											/>
											<stop
												offset="95%"
												stopColor="var(--color-real)"
												stopOpacity={0.05}
											/>
										</linearGradient>
									</defs>
									<CartesianGrid vertical={false} />
									<XAxis
										dataKey="age"
										tickLine={false}
										axisLine={false}
										tickMargin={8}
										tickFormatter={(v) => `${v}`}
									/>
									<YAxis
										tickLine={false}
										axisLine={false}
										tickMargin={8}
										width={56}
										tickFormatter={(v) => usdCompact.format(Number(v))}
									/>
									<Tooltip
										cursor={{ stroke: "var(--border)" }}
										content={<ProjectionTooltip />}
									/>
									<RechartsLegend
										wrapperStyle={{ fontSize: 12 }}
										iconType="line"
									/>
									<Area
										type="monotone"
										dataKey="nominal"
										name="Nominal"
										stroke="var(--color-nominal)"
										fill="url(#fillNominal)"
										strokeWidth={2}
									/>
									<Area
										type="monotone"
										dataKey="real"
										name="Today's $"
										stroke="var(--color-real)"
										fill="url(#fillReal)"
										strokeWidth={2}
									/>
									{result.fiNumber > 0 && (
										<ReferenceLine
											y={result.fiNumber}
											stroke="var(--color-fiTarget)"
											strokeDasharray="4 4"
											label={
												<ChartBadgeLabel
													value={`FI ${usdCompact.format(result.fiNumber)}`}
													orientation="horizontal"
													fill="var(--color-fiTarget)"
													textFill="#fff"
												/>
											}
										/>
									)}
									<ReferenceLine
										x={assumptions.retirementAge}
										stroke="var(--muted-foreground)"
										strokeDasharray="2 4"
										label={
											<ChartBadgeLabel
												value={`Retire @ ${assumptions.retirementAge}`}
												orientation="vertical"
												fill="var(--muted)"
												textFill="var(--foreground)"
												stroke="var(--border)"
											/>
										}
									/>
								</AreaChart>
							</ChartContainer>
						</CardContent>
					</Card>
				</section>

				<section>
					<Card>
						<CardHeader>
							<CardTitle>Milestones</CardTitle>
							<CardDescription>
								Projected real (today's $) net worth at key ages
							</CardDescription>
						</CardHeader>
						<CardContent>
							<MilestoneChart series={result.series} />
						</CardContent>
					</Card>
				</section>
			</main>
		</div>
	);
}

function ProjectionTooltip({
	active,
	payload,
	label,
}: {
	active?: boolean;
	payload?: Array<{
		name?: string;
		value?: number | string;
		color?: string;
		dataKey?: string;
	}>;
	label?: number | string;
}) {
	if (!active || !payload || payload.length === 0) return null;
	return (
		<div className="rounded-md border border-border bg-background/95 px-3 py-2 text-xs shadow-sm">
			<div className="mb-1 font-medium">Age {label}</div>
			<ul className="space-y-0.5">
				{payload.map((p) => (
					<li
						key={String(p.dataKey)}
						className="flex items-center justify-between gap-3"
					>
						<span className="flex items-center gap-1.5">
							<span
								className="size-2 rounded-[2px]"
								style={{ background: p.color }}
							/>
							{p.name}
						</span>
						<span className="font-mono tabular-nums">
							{usd.format(Number(p.value ?? 0))}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}

function MilestoneChart({
	series,
}: {
	series: Array<{ age: number; real: number; nominal: number }>;
}) {
	const milestones = [30, 40, 50, 60, 67, 75, 85];
	const points = milestones
		.map((age) => series.find((p) => p.age === age))
		.filter((p): p is (typeof series)[number] => Boolean(p));
	if (points.length === 0) {
		return (
			<div className="flex h-[160px] items-center justify-center text-sm text-muted-foreground">
				Not enough horizon to plot milestones
			</div>
		);
	}
	return (
		<ChartContainer
			config={{
				real: { label: "Today's $", color: "var(--chart-2)" },
			}}
			className="h-[200px] w-full"
		>
			<LineChart
				data={points}
				margin={{ left: 8, right: 16, top: 8, bottom: 0 }}
			>
				<CartesianGrid vertical={false} />
				<XAxis
					dataKey="age"
					tickLine={false}
					axisLine={false}
					tickFormatter={(v) => `Age ${v}`}
				/>
				<YAxis
					tickLine={false}
					axisLine={false}
					width={56}
					tickFormatter={(v) => usdCompact.format(Number(v))}
				/>
				<Tooltip content={<ProjectionTooltip />} />
				<Line
					type="monotone"
					dataKey="real"
					name="Today's $"
					stroke="var(--color-real)"
					strokeWidth={2}
					dot={{ r: 4 }}
				/>
			</LineChart>
		</ChartContainer>
	);
}

function BirthDatePicker({
	value,
	onChange,
}: {
	value: string;
	onChange: (next: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const date = parseISODate(value);
	const display = date
		? date.toLocaleDateString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
			})
		: "Pick a date";
	const today = new Date();
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					className={cn(
						"w-full justify-start font-normal",
						!date && "text-muted-foreground",
					)}
				>
					<HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} />
					<span>{display}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={date}
					defaultMonth={date ?? new Date(today.getFullYear() - 30, 0, 1)}
					captionLayout="dropdown"
					startMonth={new Date(1900, 0)}
					endMonth={today}
					disabled={{ after: today }}
					onSelect={(d) => {
						if (!d) return;
						onChange(formatISODate(d));
						setOpen(false);
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}

function Field({
	label,
	hint,
	children,
}: {
	label: string;
	hint?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-1">
			<Label className="text-xs">{label}</Label>
			{children}
			{hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
		</div>
	);
}

function MetricCard({
	label,
	value,
	hint,
	tone,
}: {
	label: string;
	value: string;
	hint?: string;
	tone?: "positive" | "negative" | "neutral";
}) {
	const valueColor =
		tone === "positive"
			? "text-green-600 dark:text-green-400"
			: tone === "negative"
				? "text-red-600 dark:text-red-400"
				: "";
	return (
		<Card>
			<CardHeader>
				<CardDescription>{label}</CardDescription>
				<CardTitle
					className={`font-heading text-2xl tabular-nums ${valueColor}`}
				>
					{value}
				</CardTitle>
			</CardHeader>
			{hint && (
				<CardContent>
					<p className="text-xs text-muted-foreground">{hint}</p>
				</CardContent>
			)}
		</Card>
	);
}

function numberOr(raw: string, fallback: number): number {
	const n = Number(raw);
	return Number.isFinite(n) ? n : fallback;
}

/**
 * Pill-style label for recharts ReferenceLine. Recharts injects `viewBox`
 * into label elements at render time. For a horizontal line viewBox is
 * { x, y, width, height: 0 }; for a vertical line it's { x, y, width: 0, height }.
 */
function ChartBadgeLabel({
	viewBox,
	value,
	orientation,
	fill,
	textFill,
	stroke,
}: {
	viewBox?: { x: number; y: number; width: number; height: number };
	value: string;
	orientation: "horizontal" | "vertical";
	fill: string;
	textFill: string;
	stroke?: string;
}) {
	if (!viewBox) return null;
	const padX = 6;
	const padY = 3;
	const charW = 6.2;
	const w = Math.round(value.length * charW + padX * 2);
	const h = 18;

	let x: number;
	let y: number;
	if (orientation === "horizontal") {
		// anchor to right edge of plotting area, just above the line
		x = viewBox.x + viewBox.width - w - 4;
		y = viewBox.y - h / 2;
	} else {
		// center on the vertical line, hover above the chart top
		x = viewBox.x - w / 2;
		y = viewBox.y - h - 2;
	}

	return (
		<g pointerEvents="none">
			<rect
				x={x}
				y={y}
				width={w}
				height={h}
				rx={4}
				ry={4}
				fill={fill}
				stroke={stroke ?? "none"}
				strokeWidth={stroke ? 1 : 0}
			/>
			<text
				x={x + w / 2}
				y={y + h / 2}
				textAnchor="middle"
				dominantBaseline="central"
				fontSize={11}
				fontWeight={500}
				fill={textFill}
			>
				{value}
			</text>
		</g>
	);
}
