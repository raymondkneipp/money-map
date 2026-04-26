import { describe, expect, it } from "vitest";
import {
	buildAxisConfig,
	buildAxisTicks,
	formatAxisTick,
} from "./chart-axis";

describe("buildAxisConfig", () => {
	it("uses 2-month step + month-only label for short horizons (≤12)", () => {
		const cfg = buildAxisConfig(12);
		expect(cfg.step).toBe(2);
		// April → "Apr"
		expect(cfg.fmt(new Date(2026, 3, 1))).toBe("Apr");
	});

	it("uses 12-month step + 'Mon YY' label for medium horizons (≤60)", () => {
		const cfg = buildAxisConfig(60);
		expect(cfg.step).toBe(12);
		expect(cfg.fmt(new Date(2027, 3, 1))).toBe("Apr 27");
	});

	it("uses 24-month step + year-only label for long horizons (≤120)", () => {
		const cfg = buildAxisConfig(120);
		expect(cfg.step).toBe(24);
		expect(cfg.fmt(new Date(2030, 0, 1))).toBe("2030");
	});

	it("uses 60-month step + year-only label for very long horizons (>120)", () => {
		const cfg = buildAxisConfig(240);
		expect(cfg.step).toBe(60);
		expect(cfg.fmt(new Date(2050, 0, 1))).toBe("2050");
	});
});

describe("buildAxisTicks", () => {
	it("generates 0..horizon at step intervals (inclusive when divisible)", () => {
		expect(buildAxisTicks(12, 2)).toEqual([0, 2, 4, 6, 8, 10, 12]);
	});

	it("stops before passing the horizon when not divisible", () => {
		expect(buildAxisTicks(11, 2)).toEqual([0, 2, 4, 6, 8, 10]);
	});

	it("returns just [0] when horizon is 0", () => {
		expect(buildAxisTicks(0, 2)).toEqual([0]);
	});
});

describe("formatAxisTick", () => {
	it("offsets today by month and runs cfg.fmt", () => {
		const today = new Date(2026, 0, 1); // Jan 2026
		const cfg = buildAxisConfig(12);
		// 3 months later → April
		expect(formatAxisTick(3, today, cfg)).toBe("Apr");
	});

	it("accepts string offsets (Recharts widens tick types)", () => {
		const today = new Date(2026, 0, 1);
		const cfg = buildAxisConfig(60);
		expect(formatAxisTick("12", today, cfg)).toBe("Jan 27");
	});
});
