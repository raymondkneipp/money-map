import {
	Analytics01Icon,
	ArrowRight01Icon,
	BitcoinIcon,
	ChartUpIcon,
	Copy01Icon,
	GithubIcon,
	LockIcon,
	Tick02Icon,
	WorkflowSquare10Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/")({
	component: LandingPage,
	head: () => ({
		meta: [
			{
				title: "Money Map — Visualize your finances as a flow chart",
			},
			{
				name: "description",
				content:
					"Map your income, expenses, assets, and debts as a living flow chart. Run retirement projections, track net worth, and stress-test your financial future — free, in your browser.",
			},
		],
	}),
});

function LandingPage() {
	return (
		<div className="min-h-svh bg-background text-foreground">
			<TopNav />
			<Hero />
			<FeatureGrid />
			<PreviewSection />
			<FinalCta />
			<Footer />
		</div>
	);
}

function TopNav() {
	return (
		<header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
				<Link to="/" className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<HugeiconsIcon
							icon={WorkflowSquare10Icon}
							className="size-5"
							strokeWidth={2}
						/>
					</div>
					<span className="font-heading text-base font-semibold tracking-tight">
						Money Map
					</span>
				</Link>
				<nav className="flex items-center gap-1">
					<a
						href="#features"
						className="hidden rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground sm:inline-block"
					>
						Features
					</a>
					<a
						href="#preview"
						className="hidden rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground sm:inline-block"
					>
						Preview
					</a>
					<Button asChild size="lg" className="ml-2 h-9 gap-1.5 px-4 text-sm">
						<Link to="/app">
							Open app
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								className="size-4"
								strokeWidth={2}
							/>
						</Link>
					</Button>
				</nav>
			</div>
		</header>
	);
}

function Hero() {
	return (
		<section className="relative overflow-hidden border-b border-border/60">
			{/* gradient blobs */}
			<div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute -top-40 left-1/4 size-[28rem] rounded-full bg-primary/15 blur-3xl" />
				<div className="absolute right-0 top-32 size-[24rem] rounded-full bg-[color:var(--chart-2)]/15 blur-3xl" />
			</div>

			<div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
				<div className="space-y-6">
					<div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
						<span className="size-1.5 rounded-full bg-primary" />
						Personal finance, visualized
					</div>
					<h1 className="font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
						See where every{" "}
						<span className="bg-gradient-to-r from-primary to-[color:var(--chart-2)] bg-clip-text text-transparent">
							dollar flows
						</span>
						.
					</h1>
					<p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
						Money Map turns income, expenses, assets, and debt into a living
						flow chart. Drag nodes, wire allocations, and watch your net worth,
						stats, and retirement projections update in real time.
					</p>
					<div className="flex flex-wrap items-center gap-3">
						<Button asChild size="lg" className="h-11 gap-2 px-5 text-sm">
							<Link to="/app">
								Launch the app
								<HugeiconsIcon
									icon={ArrowRight01Icon}
									className="size-4"
									strokeWidth={2}
								/>
							</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							size="lg"
							className="h-11 gap-2 px-5 text-sm"
						>
							<a href="#preview">See a preview</a>
						</Button>
					</div>
					<div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs text-muted-foreground">
						<span className="inline-flex items-center gap-1.5">
							<HugeiconsIcon
								icon={LockIcon}
								className="size-3.5"
								strokeWidth={2}
							/>
							Local-first — your data never leaves your browser
						</span>
						<span>· Free, no signup</span>
					</div>
				</div>

				<HeroFlowMock />
			</div>
		</section>
	);
}

/**
 * Static mock of the flow canvas. Uses the same color tokens as the real app
 * (--color-income, --color-assets, --color-expenses) so it always matches the theme.
 */
function HeroFlowMock() {
	return (
		<div className="relative">
			<div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-[color:var(--chart-2)]/10 blur-2xl" />
			<div
				className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
				style={{
					backgroundImage:
						"radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)",
					backgroundSize: "20px 20px",
				}}
			>
				<svg
					className="absolute inset-0 size-full"
					viewBox="0 0 400 300"
					fill="none"
					aria-hidden
				>
					<title>Money flow diagram</title>
					{/* income -> checking */}
					<path
						d="M 90 90 C 140 90, 160 150, 200 150"
						stroke="var(--color-income-border, var(--chart-3))"
						strokeWidth="1.5"
						strokeDasharray="4 3"
					/>
					{/* checking -> savings */}
					<path
						d="M 240 150 C 280 150, 290 90, 320 90"
						stroke="var(--color-assets-border, var(--chart-1))"
						strokeWidth="1.5"
					/>
					{/* checking -> expenses */}
					<path
						d="M 240 165 C 280 170, 290 220, 320 220"
						stroke="var(--color-expenses-border, var(--destructive))"
						strokeWidth="1.5"
					/>
				</svg>

				<MockNode
					className="absolute left-[6%] top-[22%]"
					tone="income"
					label="Salary"
					value="$8,400/mo"
				/>
				<MockNode
					className="absolute left-[42%] top-[44%]"
					tone="checking"
					label="Checking"
					value="$12,300"
				/>
				<MockNode
					className="absolute right-[6%] top-[22%]"
					tone="assets"
					label="Brokerage"
					value="$184k"
				/>
				<MockNode
					className="absolute right-[6%] bottom-[18%]"
					tone="expenses"
					label="Rent"
					value="$2,100/mo"
				/>
			</div>
		</div>
	);
}

function MockNode({
	className,
	tone,
	label,
	value,
}: {
	className?: string;
	tone: "income" | "checking" | "assets" | "expenses";
	label: string;
	value: string;
}) {
	const styles: Record<string, string> = {
		income:
			"bg-[color:var(--color-income,oklch(0.96_0.05_140))] border-[color:var(--color-income-border,var(--chart-3))]",
		checking: "bg-card border-border",
		assets:
			"bg-[color:var(--color-assets,oklch(0.96_0.05_280))] border-[color:var(--color-assets-border,var(--chart-1))]",
		expenses:
			"bg-[color:var(--color-expenses,oklch(0.96_0.05_25))] border-[color:var(--color-expenses-border,var(--destructive))]",
	};
	return (
		<div
			className={`min-w-[110px] rounded-lg border-2 px-3 py-2 shadow-sm ${styles[tone]} ${className ?? ""}`}
		>
			<div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
				{label}
			</div>
			<div className="font-mono text-sm font-semibold tabular-nums">
				{value}
			</div>
		</div>
	);
}

function FeatureGrid() {
	const features = [
		{
			icon: WorkflowSquare10Icon,
			title: "Flow-chart finances",
			body: "Build your money picture by dragging nodes for income, accounts, expenses, and debt — then connect them to see exactly where each dollar goes.",
		},
		{
			icon: Analytics01Icon,
			title: "Live stats dashboard",
			body: "Net worth, cash flow, debt-to-income, asset allocation, and category breakdowns update the moment you change a node.",
		},
		{
			icon: ChartUpIcon,
			title: "Retirement projections",
			body: "Project nominal and inflation-adjusted net worth to any age. Compute your FI number, early-retirement age, and safe withdrawal income.",
		},
		{
			icon: Copy01Icon,
			title: "What-if scenarios",
			body: 'Duplicate your map, tweak one assumption, and compare futures side by side. "Switch jobs," "buy a house," "retire at 55" — keep them all.',
		},
		{
			icon: BitcoinIcon,
			title: "Crypto-aware",
			body: "Hold BTC, ETH, or SOL? Live prices stream in and roll through your projections with adjustable growth assumptions.",
		},
	];
	return (
		<section
			id="features"
			className="border-b border-border/60 px-6 py-20 lg:py-28"
		>
			<div className="mx-auto max-w-6xl">
				<div className="mb-12 max-w-2xl">
					<h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
						Everything you need to model your money.
					</h2>
					<p className="mt-3 text-base text-muted-foreground">
						No spreadsheets. No bank-account permissions. Just a fast,
						interactive canvas that mirrors how you actually think about your
						finances.
					</p>
				</div>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{features.map((f) => (
						<Card key={f.title} className="border-border/60">
							<CardHeader>
								<div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<HugeiconsIcon
										icon={f.icon}
										className="size-5"
										strokeWidth={2}
									/>
								</div>
								<CardTitle className="font-heading text-base">
									{f.title}
								</CardTitle>
								<CardDescription className="leading-relaxed">
									{f.body}
								</CardDescription>
							</CardHeader>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}

function PreviewSection() {
	return (
		<section
			id="preview"
			className="border-b border-border/60 bg-muted/30 px-6 py-20 lg:py-28"
		>
			<div className="mx-auto max-w-6xl">
				<div className="mb-12 max-w-2xl">
					<h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
						Your money, every angle.
					</h2>
					<p className="mt-3 text-base text-muted-foreground">
						The same nodes power three coordinated views — the canvas you build
						on, a live stats dashboard, and a long-horizon projection.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					<MockMetricCard
						label="Net worth"
						value="$284,120"
						hint="Assets − debt"
						tone="positive"
					/>
					<MockMetricCard
						label="Monthly cash flow"
						value="+$3,180"
						hint="Income − expenses"
						tone="positive"
					/>
					<MockMetricCard
						label="FI number"
						value="$1.42M"
						hint="4% rule on $56,800/yr"
					/>
					<MockMetricCard
						label="Early retirement"
						value="Age 51"
						hint="When real net worth ≥ FI"
						tone="positive"
					/>
				</div>

				<div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
					<Card className="border-border/60 lg:col-span-2">
						<CardHeader>
							<div className="flex items-start justify-between gap-4">
								<div>
									<CardTitle className="font-heading">
										Net worth projection
									</CardTitle>
									<CardDescription>
										Nominal vs. inflation-adjusted growth through age 85
									</CardDescription>
								</div>
								<ScenarioPills
									active="Switch jobs"
									options={["Base", "Switch jobs", "Buy a house"]}
								/>
							</div>
						</CardHeader>
						<CardContent>
							<MockProjectionChart />
						</CardContent>
					</Card>
					<Card className="border-border/60">
						<CardHeader>
							<CardTitle className="font-heading">Allocation</CardTitle>
							<CardDescription>How your assets split today</CardDescription>
						</CardHeader>
						<CardContent>
							<MockAllocationBars />
						</CardContent>
					</Card>
				</div>

				<div className="mt-10 flex justify-center">
					<Button asChild size="lg" className="h-11 gap-2 px-5 text-sm">
						<Link to="/app">
							Try it with your numbers
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								className="size-4"
								strokeWidth={2}
							/>
						</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}

function MockMetricCard({
	label,
	value,
	hint,
	tone,
}: {
	label: string;
	value: string;
	hint?: string;
	tone?: "positive" | "negative";
}) {
	const valueColor =
		tone === "positive"
			? "text-green-600 dark:text-green-400"
			: tone === "negative"
				? "text-red-600 dark:text-red-400"
				: "";
	return (
		<Card className="border-border/60">
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

function ScenarioPills({
	active,
	options,
}: {
	active: string;
	options: string[];
}) {
	return (
		<div className="hidden flex-wrap items-center gap-1.5 sm:flex">
			{options.map((name) => {
				const isActive = name === active;
				return (
					<span
						key={name}
						className={
							isActive
								? "inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
								: "inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground"
						}
					>
						{isActive && (
							<HugeiconsIcon
								icon={Tick02Icon}
								className="size-3"
								strokeWidth={2.5}
							/>
						)}
						{name}
					</span>
				);
			})}
		</div>
	);
}

/** Inline SVG sketch of an area-chart projection — purely decorative. */
function MockProjectionChart() {
	return (
		<svg
			viewBox="0 0 600 220"
			className="h-[220px] w-full"
			preserveAspectRatio="none"
			aria-hidden
		>
			<title>Net worth growth curve</title>
			<defs>
				<linearGradient id="lp-nominal" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
					<stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
				</linearGradient>
				<linearGradient id="lp-real" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.45} />
					<stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.02} />
				</linearGradient>
			</defs>

			{/* gridlines */}
			{[40, 90, 140, 190].map((y) => (
				<line
					key={y}
					x1="0"
					x2="600"
					y1={y}
					y2={y}
					stroke="var(--border)"
					strokeDasharray="2 4"
				/>
			))}

			{/* nominal area */}
			<path
				d="M 0 200 C 80 195, 160 180, 240 150 C 320 115, 400 70, 480 35 L 600 10 L 600 220 L 0 220 Z"
				fill="url(#lp-nominal)"
			/>
			<path
				d="M 0 200 C 80 195, 160 180, 240 150 C 320 115, 400 70, 480 35 L 600 10"
				stroke="var(--chart-1)"
				strokeWidth="2"
				fill="none"
			/>

			{/* real (today's $) area */}
			<path
				d="M 0 205 C 80 202, 160 192, 240 175 C 320 155, 400 135, 480 115 L 600 100 L 600 220 L 0 220 Z"
				fill="url(#lp-real)"
			/>
			<path
				d="M 0 205 C 80 202, 160 192, 240 175 C 320 155, 400 135, 480 115 L 600 100"
				stroke="var(--chart-2)"
				strokeWidth="2"
				fill="none"
			/>

			{/* FI line */}
			<line
				x1="0"
				x2="600"
				y1="60"
				y2="60"
				stroke="var(--chart-4)"
				strokeDasharray="4 4"
			/>
			{/* FI badge — pill anchored to the right end of the line */}
			<g transform="translate(520, 51)">
				<rect width="76" height="18" rx="4" ry="4" fill="var(--chart-4)" />
				<text
					x="38"
					y="9"
					textAnchor="middle"
					dominantBaseline="central"
					fontSize="11"
					fontWeight="500"
					fill="#fff"
				>
					FI $1.42M
				</text>
			</g>
		</svg>
	);
}

function MockAllocationBars() {
	const rows = [
		{ name: "Brokerage", pct: 42, color: "var(--chart-1)" },
		{ name: "Retirement", pct: 28, color: "var(--chart-2)" },
		{ name: "Cash & savings", pct: 18, color: "var(--chart-3)" },
		{ name: "Crypto", pct: 8, color: "var(--chart-4)" },
		{ name: "Other", pct: 4, color: "var(--chart-5)" },
	];
	return (
		<ul className="space-y-3">
			{rows.map((r) => (
				<li key={r.name} className="space-y-1">
					<div className="flex items-center justify-between text-xs">
						<span>{r.name}</span>
						<span className="font-mono tabular-nums text-muted-foreground">
							{r.pct}%
						</span>
					</div>
					<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
						<div
							className="h-full rounded-full"
							style={{ width: `${r.pct}%`, background: r.color }}
						/>
					</div>
				</li>
			))}
		</ul>
	);
}

function FinalCta() {
	return (
		<section className="border-b border-border/60 px-6 py-24">
			<div className="mx-auto max-w-3xl text-center">
				<h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
					Map your money. Today.
				</h2>
				<p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
					Free, runs in your browser, and your data stays on your device. No
					signup, no bank linking, no analytics on your finances.
				</p>
				<div className="mt-7 flex flex-wrap justify-center gap-3">
					<Button asChild size="lg" className="h-11 gap-2 px-5 text-sm">
						<Link to="/app">
							Open Money Map
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								className="size-4"
								strokeWidth={2}
							/>
						</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}

function Footer() {
	return (
		<footer className="px-6 py-10">
			<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
				<div className="flex items-center gap-2">
					<div className="flex size-5 items-center justify-center rounded bg-primary text-primary-foreground">
						<HugeiconsIcon
							icon={WorkflowSquare10Icon}
							className="size-3"
							strokeWidth={2}
						/>
					</div>
					<span>
						© {new Date().getFullYear()} Money Map · made by{" "}
						<a
							href="https://raymondkneipp.com"
							target="_blank"
							rel="noreferrer"
							className="font-medium text-foreground hover:underline"
						>
							Raymond Kneipp
						</a>
					</span>
				</div>
				<div className="flex items-center gap-4">
					<Link to="/app" className="hover:text-foreground">
						Open app
					</Link>
					<a
						href="https://github.com/raymondkneipp/money-map"
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-1.5 hover:text-foreground"
					>
						<HugeiconsIcon
							icon={GithubIcon}
							className="size-3.5"
							strokeWidth={2}
						/>
						GitHub
					</a>
				</div>
			</div>
		</footer>
	);
}
