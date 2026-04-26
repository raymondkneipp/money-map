/**
 * Tiny typed wrapper around `window.localStorage`. Centralizes the SSR guard
 * (`typeof window === "undefined"`), JSON parse/stringify, and try/catch so
 * call sites can stay focused on what they're persisting.
 *
 * `validate` is optional but recommended — it lets a caller reject saved data
 * that doesn't match the current shape (e.g. an older schema), returning
 * `null` so the caller can fall back to a default.
 */

export function loadJSON<T>(
	key: string,
	validate?: (raw: unknown) => raw is T,
): T | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as unknown;
		if (validate && !validate(parsed)) return null;
		return parsed as T;
	} catch {
		return null;
	}
}

export function saveJSON<T>(key: string, value: T): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch {}
}
