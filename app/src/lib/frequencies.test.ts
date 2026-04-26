import { describe, expect, it } from "vitest";
import { FREQUENCIES, FREQUENCY_BY_ID, toAnnual } from "./frequencies";

describe("toAnnual", () => {
	it("multiplies a per-period amount by perYear", () => {
		expect(toAnnual(100, "weekly")).toBe(5200);
		expect(toAnnual(1000, "monthly")).toBe(12000);
		expect(toAnnual(50000, "annually")).toBe(50000);
	});

	it("returns 0 for a zero amount regardless of frequency", () => {
		for (const f of FREQUENCIES) {
			expect(toAnnual(0, f.id)).toBe(0);
		}
	});
});

describe("FREQUENCY_BY_ID", () => {
	it("indexes every FREQUENCIES entry by id", () => {
		for (const f of FREQUENCIES) {
			expect(FREQUENCY_BY_ID[f.id]).toBe(f);
		}
	});
});
