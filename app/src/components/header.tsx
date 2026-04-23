import { Link } from "@tanstack/react-router";
import ThemeToggle from "./ThemeToggle";

export function Header() {
	return (
		<header className="fixed top-4 bottom-4 left-4 w-fit z-50 border rounded border-[var(--line)] bg-[var(--header-bg)] p-4 backdrop-blur-md">
			<nav className="flex flex-col flex-wrap items-center gap-x-3 gap-y-2">
				<h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
					<Link
						to="/"
						className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] sm:px-4 sm:py-2"
					>
						<span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
						Money Map
					</Link>
				</h2>

				<div className="ml-auto flex items-center gap-1.5 sm:ml-0 sm:gap-2">
					<ThemeToggle />
				</div>

				<div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-2 sm:w-auto sm:flex-nowrap sm:pb-0">
					<Link
						to="/"
						className="nav-link"
						activeProps={{ className: "nav-link is-active" }}
					>
						Home
					</Link>
					<details className="relative w-full sm:w-auto">
						<summary className="nav-link list-none cursor-pointer">
							Demos
						</summary>
						<div className="mt-2 min-w-56 rounded-xl border border-[var(--line)] bg-[var(--header-bg)] p-2 shadow-lg sm:absolute sm:right-0">
							<a
								href="/demo/form/simple"
								className="block rounded-lg px-3 py-2 text-sm text-[var(--sea-ink-soft)] no-underline transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
							>
								Simple Form
							</a>
							<a
								href="/demo/form/address"
								className="block rounded-lg px-3 py-2 text-sm text-[var(--sea-ink-soft)] no-underline transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
							>
								Address Form
							</a>
							<a
								href="/demo/table"
								className="block rounded-lg px-3 py-2 text-sm text-[var(--sea-ink-soft)] no-underline transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
							>
								TanStack Table
							</a>
						</div>
					</details>
				</div>
			</nav>
		</header>
	);
}
