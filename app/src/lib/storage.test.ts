import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadJSON, saveJSON } from "./storage";

// Minimal in-memory localStorage shim that mimics the parts we use.
function createMemoryStorage(): Storage {
	const map = new Map<string, string>();
	return {
		getItem: (k) => (map.has(k) ? (map.get(k) as string) : null),
		setItem: (k, v) => {
			map.set(k, v);
		},
		removeItem: (k) => {
			map.delete(k);
		},
		clear: () => {
			map.clear();
		},
		key: (i) => Array.from(map.keys())[i] ?? null,
		get length() {
			return map.size;
		},
	};
}

beforeEach(() => {
	vi.stubGlobal("window", { localStorage: createMemoryStorage() });
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("saveJSON / loadJSON", () => {
	it("round-trips a JSON-serializable value", () => {
		saveJSON("k", { a: 1, b: [2, 3] });
		expect(loadJSON("k")).toEqual({ a: 1, b: [2, 3] });
	});

	it("returns null for missing keys", () => {
		expect(loadJSON("missing")).toBeNull();
	});

	it("returns null when the stored JSON is corrupt", () => {
		window.localStorage.setItem("k", "{not json");
		expect(loadJSON("k")).toBeNull();
	});

	it("rejects values that fail the validator", () => {
		saveJSON("k", { a: 1 });
		const isShape = (raw: unknown): raw is { b: number } =>
			typeof (raw as { b?: unknown })?.b === "number";
		expect(loadJSON("k", isShape)).toBeNull();
	});

	it("accepts values that pass the validator", () => {
		saveJSON("k", { b: 7 });
		const isShape = (raw: unknown): raw is { b: number } =>
			typeof (raw as { b?: unknown })?.b === "number";
		expect(loadJSON("k", isShape)).toEqual({ b: 7 });
	});
});
