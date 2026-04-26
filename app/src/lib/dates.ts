/**
 * Date helpers used across the app. All operations are local-time so a
 * `yyyy-mm-dd` value round-trips to the same calendar day the user picked
 * in the calendar UI.
 */

/**
 * Parse a `yyyy-mm-dd` string into a local Date. Returns `undefined` for
 * non-matching input so callers can branch instead of silently getting
 * Invalid Date.
 */
export function parseISODate(value: string): Date | undefined {
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!m) return undefined;
	const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
	return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Format a Date as `yyyy-mm-dd` in local time. */
export function formatISODate(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

/**
 * Whole years between `birthDate` (yyyy-mm-dd) and `on`. Honors month/day
 * so an upcoming birthday this year hasn't bumped age yet. Returns 0 for
 * unparsable input or future birthdates.
 */
export function ageInYears(birthDate: string, on: Date = new Date()): number {
	const b = parseISODate(birthDate) ?? new Date(birthDate);
	if (Number.isNaN(b.getTime())) return 0;
	let years = on.getFullYear() - b.getFullYear();
	const beforeBirthday =
		on.getMonth() < b.getMonth() ||
		(on.getMonth() === b.getMonth() && on.getDate() < b.getDate());
	if (beforeBirthday) years -= 1;
	return Math.max(0, years);
}

/** First day of the current month, local time. */
export function startOfThisMonth(now: Date = new Date()): Date {
	return new Date(now.getFullYear(), now.getMonth(), 1);
}

/** Return `today` shifted forward by `offset` months. */
export function dateForMonthOffset(today: Date, offset: number): Date {
	return new Date(today.getFullYear(), today.getMonth() + offset, 1);
}

/** "Apr 2027" style label. */
export function formatMonthYear(d: Date): string {
	return d.toLocaleString("en-US", { month: "short", year: "numeric" });
}
