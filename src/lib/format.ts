/**
 * Display formatters used across the app. Centralized so the look is
 * consistent and tests have a single source of truth.
 */

import type { Frequency } from "#/components/flow/types";
import { FREQUENCY_BY_ID } from "#/lib/frequencies";

/** USD with no fractional cents — the default money formatter. */
export const usd = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 0,
});

/** USD with full cents, e.g. for tooltip readouts that need precision. */
export const usdPrecise = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

/** USD with explicit sign for deltas (always shows "+$" / "-$"). */
export const usdSigned = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 0,
	signDisplay: "exceptZero",
});

/** Compact USD ("$1.2M") for axis labels and other tight surfaces. */
export const usdCompact = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	notation: "compact",
	maximumFractionDigits: 1,
});

/** Crypto-style unit count — up to eight fractional digits (BTC satoshi
 * precision), no currency symbol. */
export const coinUnits = new Intl.NumberFormat("en-US", {
	maximumFractionDigits: 8,
});

/**
 * Render a debt payoff horizon ("3 mo", "4.2 yr", "12 yr") given total
 * months. Returns `"—"` for non-finite or non-positive inputs so the UI can
 * always display *something*.
 */
export function formatPayoff(months: number): string {
	if (!Number.isFinite(months) || months <= 0) return "—";
	if (months < 12) return `${Math.ceil(months)} mo`;
	const years = months / 12;
	if (years < 10) return `${years.toFixed(1)} yr`;
	return `${Math.round(years)} yr`;
}

/** Convert an annualized amount back to a "$X/wk"-style string. */
export function formatAnnualAs(annual: number, frequency: Frequency): string {
	const perPeriod = annual / FREQUENCY_BY_ID[frequency].perYear;
	return `${usd.format(perPeriod)}/${FREQUENCY_BY_ID[frequency].abbr}`;
}
