/**
 * Pure helpers for the time-axis on month-indexed projection charts. Pick a
 * tick step + label format based on horizon length, then turn a month offset
 * into a `Date` so it can be formatted relative to "today".
 */

import { dateForMonthOffset } from "#/lib/dates";

export type AxisConfig = {
	/** Stride between displayed ticks, in months. */
	step: number;
	/** Renders a tick label given the date that the tick falls on. */
	fmt: (d: Date) => string;
};

/**
 * Tick density + label format depend on the horizon. Anchor at the current
 * month so labels read like a calendar instead of a month counter.
 *   ≤ 12 mo  → every 2 months,  "Apr"
 *   ≤ 60 mo  → every year,      "Apr 27"
 *   ≤ 120 mo → every 2 years,   "2030"
 *   else     → every 5 years,   "2050"
 */
export function buildAxisConfig(horizonMonths: number): AxisConfig {
	if (horizonMonths <= 12) {
		return {
			step: 2,
			fmt: (d) => d.toLocaleString("en-US", { month: "short" }),
		};
	}
	if (horizonMonths <= 60) {
		return {
			step: 12,
			fmt: (d) =>
				d.toLocaleString("en-US", { month: "short", year: "2-digit" }),
		};
	}
	const step = horizonMonths <= 120 ? 24 : 60;
	return { step, fmt: (d) => String(d.getFullYear()) };
}

/** Generate the actual month-offset values (0, step, 2·step, …, ≤ horizon). */
export function buildAxisTicks(horizonMonths: number, step: number): number[] {
	const ticks: number[] = [];
	for (let m = 0; m <= horizonMonths; m += step) ticks.push(m);
	return ticks;
}

/**
 * Convenience formatter: turn a month offset (relative to `today`) into a
 * tick label using `cfg.fmt`. Recharts passes ticks as either number or
 * string, so the input is widened to match.
 */
export function formatAxisTick(
	monthOffset: number | string,
	today: Date,
	cfg: AxisConfig,
): string {
	return cfg.fmt(dateForMonthOffset(today, Number(monthOffset)));
}
