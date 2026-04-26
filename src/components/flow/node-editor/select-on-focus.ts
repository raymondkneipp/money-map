import type { FocusEvent } from "react";

/**
 * Selects the input's full value on focus. Useful for short numeric fields
 * where overwriting is the typical action.
 *
 * Uses `requestAnimationFrame` so the selection sticks even when focus is
 * triggered by a mouse click — without it, the click's caret-positioning
 * would happen *after* focus and clear the selection.
 */
export function selectOnFocus(e: FocusEvent<HTMLInputElement>) {
	const target = e.currentTarget;
	requestAnimationFrame(() => target.select());
}
