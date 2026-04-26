import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	XAxis,
	YAxis,
} from "recharts";
import { fetchCoinPrice } from "#/components/flow/crypto-price";
import { useFlowState } from "#/components/flow/flow-state";
import type { CryptoCoinId } from "#/components/flow/types";
import { coinUnits, usd, usdPrecise, usdSigned } from "#/lib/format";
import {
	assetAllocation,
	cryptoHoldings,
	debtsByType,
	debtToIncome,
	expensesByCategory,
	monthlyBreakdown,
	monthlyCashFlow,
	monthlyDebtMinimums,
	monthlyExpenses,
	monthlyIncome,
	netWorth,
	totalDebt,
	uniqueCryptoCoins,
} from "#/lib/stats";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const Route = createFileRoute("/stats")({ component: StatsPage });

function formatCoinPrice(price: number): string {
	if (price === 0) return "—";
	if (price >= 1) return usdPrecise.format(price);
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 6,
	}).format(price);
}

const PALETTE = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
	"var(--color-blue-500)",
	"var(--color-green-500)",
	"var(--color-amber-500)",
	"var(--color-red-500)",
	"var(--color-purple-500)",
];

function StatsPage() {
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

	const income = monthlyIncome(nodes);
	const expenses = monthlyExpenses(nodes);
	const debtMin = monthlyDebtMinimums(nodes);
	const cashFlow = monthlyCashFlow(nodes);
	const dti = debtToIncome(nodes);
	const debt = totalDebt(nodes);
	const worth = netWorth(nodes, cryptoPrices);

	const holdings = cryptoHoldings(nodes, cryptoPrices);
	const cryptoTotal = holdings.reduce((s, h) => s + h.value, 0);
	const allocation = assetAllocation(nodes, cryptoPrices);
	const breakdown = monthlyBreakdown(nodes, edges);
	const expenseCats = expensesByCategory(nodes);
	const debtTypes = debtsByType(nodes);

	const allocationConfig: ChartConfig = Object.fromEntries(
		allocation.map((a, i) => [
			a.bucket,
			{ label: a.label, color: PALETTE[i % PALETTE.length] },
		]),
	);
	const breakdownConfig: ChartConfig = Object.fromEntries(
		breakdown.map((s, i) => [
			s.id,
			{ label: s.label, color: PALETTE[i % PALETTE.length] },
		]),
	);
	const expenseConfig: ChartConfig = {
		monthly: { label: "Monthly", color: "var(--chart-2)" },
	};
	const debtConfig: ChartConfig = {
		principal: { label: "Balance", color: "var(--debts-border)" },
	};

	return (
		<div className="flex min-h-svh flex-col">
			<header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
				<SidebarTrigger variant="secondary" size="icon-lg" />
				<h1 className="font-heading text-lg font-medium">Stats</h1>
			</header>

			<main className="flex-1 space-y-6 px-6 py-6">
				<section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					<MetricCard
						label="Net worth"
						value={usdSigned.format(worth)}
						hint={`Assets ${usd.format(worth + debt)} − debt ${usd.format(debt)}`}
						tone={worth >= 0 ? "positive" : "negative"}
					/>
					<MetricCard
						label="Monthly cash flow"
						value={usdSigned.format(cashFlow)}
						hint={`Income ${usd.format(income)} − expenses ${usd.format(expenses)} − debt min ${usd.format(debtMin)}`}
						tone={cashFlow >= 0 ? "positive" : "negative"}
					/>
					<MetricCard
						label="Debt-to-income"
						value={`${dti.toFixed(1)}%`}
						hint={
							dti < 36
								? "Healthy (under 36%)"
								: dti < 43
									? "Caution (36-43%)"
									: "High (above 43%)"
						}
						tone={dti < 36 ? "positive" : dti < 43 ? "neutral" : "negative"}
					/>
					<MetricCard
						label="Total debt"
						value={usd.format(debt)}
						hint={`Min payments ${usd.format(debtMin)}/mo`}
						tone={debt > 0 ? "neutral" : "positive"}
					/>
				</section>

				<section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Asset allocation</CardTitle>
							<CardDescription>
								Where your wealth sits today across account types
							</CardDescription>
						</CardHeader>
						<CardContent>
							{allocation.length === 0 ? (
								<EmptyState>No assets yet</EmptyState>
							) : (
								<ChartContainer
									config={allocationConfig}
									className="mx-auto aspect-square max-h-[300px]"
								>
									<PieChart>
										<ChartTooltip
											content={
												<ChartTooltipContent
													hideLabel
													formatter={(v, _n, item) => (
														<div className="flex w-full items-center justify-between gap-3">
															<span className="flex items-center gap-2">
																<span
																	className="size-2 rounded-[2px]"
																	style={{
																		background: item?.payload?.fill,
																	}}
																/>
																{item?.payload?.label}
															</span>
															<span className="font-mono font-medium tabular-nums">
																{usd.format(Number(v))}
															</span>
														</div>
													)}
												/>
											}
										/>
										<Pie
											data={allocation}
											dataKey="value"
											nameKey="label"
											innerRadius={60}
											outerRadius={100}
											strokeWidth={2}
										>
											{allocation.map((_, i) => (
												<Cell
													key={`a-${i}`}
													fill={PALETTE[i % PALETTE.length]}
												/>
											))}
										</Pie>
									</PieChart>
								</ChartContainer>
							)}
							<Legend
								items={allocation.map((a, i) => ({
									label: a.label,
									value: usd.format(a.value),
									color: PALETTE[i % PALETTE.length],
								}))}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Monthly breakdown</CardTitle>
							<CardDescription>
								How each dollar of income is currently spent
							</CardDescription>
						</CardHeader>
						<CardContent>
							{breakdown.length === 0 ? (
								<EmptyState>No allocations yet</EmptyState>
							) : (
								<ChartContainer
									config={breakdownConfig}
									className="mx-auto aspect-square max-h-[300px]"
								>
									<PieChart>
										<ChartTooltip
											content={
												<ChartTooltipContent
													hideLabel
													formatter={(v, _n, item) => (
														<div className="flex w-full items-center justify-between gap-3">
															<span className="flex items-center gap-2">
																<span
																	className="size-2 rounded-[2px]"
																	style={{
																		background: item?.payload?.fill,
																	}}
																/>
																{item?.payload?.label}
															</span>
															<span className="font-mono font-medium tabular-nums">
																{usd.format(Number(v))}/mo
															</span>
														</div>
													)}
												/>
											}
										/>
										<Pie
											data={breakdown}
											dataKey="monthly"
											nameKey="label"
											innerRadius={60}
											outerRadius={100}
											strokeWidth={2}
										>
											{breakdown.map((_, i) => (
												<Cell
													key={`b-${i}`}
													fill={PALETTE[i % PALETTE.length]}
												/>
											))}
										</Pie>
									</PieChart>
								</ChartContainer>
							)}
							<Legend
								items={breakdown.map((s, i) => ({
									label: s.label,
									value: `${usd.format(s.monthly)}/mo`,
									color: PALETTE[i % PALETTE.length],
								}))}
							/>
						</CardContent>
					</Card>
				</section>

				<section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Expenses by category</CardTitle>
							<CardDescription>Monthly spend per category</CardDescription>
						</CardHeader>
						<CardContent>
							{expenseCats.length === 0 ? (
								<EmptyState>No expenses yet</EmptyState>
							) : (
								<ChartContainer
									config={expenseConfig}
									className="h-[260px] w-full"
								>
									<BarChart
										data={expenseCats}
										layout="vertical"
										margin={{ left: 8, right: 16 }}
									>
										<CartesianGrid horizontal={false} />
										<XAxis
											type="number"
											tickFormatter={(v) => usd.format(Number(v))}
										/>
										<YAxis
											dataKey="label"
											type="category"
											width={90}
											tickLine={false}
											axisLine={false}
										/>
										<ChartTooltip
											content={
												<ChartTooltipContent
													formatter={(v) => `${usd.format(Number(v))}/mo`}
												/>
											}
										/>
										<Bar
											dataKey="monthly"
											fill="var(--expenses-border)"
											radius={[0, 4, 4, 0]}
										/>
									</BarChart>
								</ChartContainer>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Debt by type</CardTitle>
							<CardDescription>Outstanding balances</CardDescription>
						</CardHeader>
						<CardContent>
							{debtTypes.length === 0 ? (
								<EmptyState>Debt-free</EmptyState>
							) : (
								<ChartContainer
									config={debtConfig}
									className="h-[260px] w-full"
								>
									<BarChart
										data={debtTypes}
										layout="vertical"
										margin={{ left: 8, right: 16 }}
									>
										<CartesianGrid horizontal={false} />
										<XAxis
											type="number"
											tickFormatter={(v) => usd.format(Number(v))}
										/>
										<YAxis
											dataKey="label"
											type="category"
											width={100}
											tickLine={false}
											axisLine={false}
										/>
										<ChartTooltip
											content={
												<ChartTooltipContent
													formatter={(v) => usd.format(Number(v))}
												/>
											}
										/>
										<Bar
											dataKey="principal"
											fill="var(--debts-border)"
											radius={[0, 4, 4, 0]}
										/>
									</BarChart>
								</ChartContainer>
							)}
						</CardContent>
					</Card>
				</section>

				<section>
					<Card>
						<CardHeader>
							<CardTitle>Crypto holdings</CardTitle>
							<CardDescription>
								{holdings.length === 0
									? "No coins held"
									: `${holdings.length} coin${holdings.length === 1 ? "" : "s"} · ${usd.format(cryptoTotal)} total`}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{holdings.length === 0 ? (
								<EmptyState>No crypto positions yet</EmptyState>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full text-sm">
										<thead>
											<tr className="border-b border-border text-left text-xs text-muted-foreground">
												<th className="py-2 pr-4 font-medium">Coin</th>
												<th className="py-2 pr-4 text-right font-medium">
													Holdings
												</th>
												<th className="py-2 pr-4 text-right font-medium">
													Price
												</th>
												<th className="py-2 text-right font-medium">Value</th>
											</tr>
										</thead>
										<tbody>
											{holdings.map((h) => (
												<tr
													key={h.coin}
													className="border-b border-border/50 last:border-0"
												>
													<td className="py-2.5 pr-4">
														<div className="flex flex-col">
															<span className="font-medium">{h.name}</span>
															<span className="text-xs text-muted-foreground">
																{h.symbol}
															</span>
														</div>
													</td>
													<td className="py-2.5 pr-4 text-right font-mono tabular-nums">
														{coinUnits.format(h.units)}{" "}
														<span className="text-xs text-muted-foreground">
															{h.symbol}
														</span>
													</td>
													<td className="py-2.5 pr-4 text-right font-mono tabular-nums text-muted-foreground">
														{formatCoinPrice(h.price)}
													</td>
													<td className="py-2.5 text-right font-mono font-medium tabular-nums">
														{h.price === 0 ? "—" : usd.format(h.value)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</CardContent>
					</Card>
				</section>
			</main>
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

function Legend({
	items,
}: {
	items: Array<{ label: string; value: string; color: string }>;
}) {
	if (items.length === 0) return null;
	return (
		<ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
			{items.map((it) => (
				<li key={it.label} className="flex items-center justify-between gap-2">
					<span className="flex min-w-0 items-center gap-2">
						<span
							className="size-2 shrink-0 rounded-[2px]"
							style={{ background: it.color }}
						/>
						<span className="truncate">{it.label}</span>
					</span>
					<span className="font-mono tabular-nums text-muted-foreground">
						{it.value}
					</span>
				</li>
			))}
		</ul>
	);
}

function EmptyState({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
			{children}
		</div>
	);
}
