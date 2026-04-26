import { describe, expect, it } from "vitest";
import {
	coinUnits,
	formatAnnualAs,
	formatPayoff,
	usd,
	usdCompact,
	usdPrecise,
	usdSigned,
} from "./format";

describe("usd formatters", () => {
	it("default usd shows no fractional cents", () => {
		expect(usd.format(1234)).toBe("$1,234");
		expect(usd.format(1234.99)).toBe("$1,235");
	});

	it("usdPrecise shows two fractional digits", () => {
		expect(usdPrecise.format(1234)).toBe("$1,234.00");
		expect(usdPrecise.format(1.1)).toBe("$1.10");
	});

	it("usdSigned always shows a sign for nonzero values", () => {
		expect(usdSigned.format(100)).toBe("+$100");
		expect(usdSigned.format(-100)).toBe("-$100");
		expect(usdSigned.format(0)).toBe("$0");
	});

	it("usdCompact uses compact notation", () => {
		expect(usdCompact.format(1_500_000)).toBe("$1.5M");
		expect(usdCompact.format(2_500)).toBe("$2.5K");
	});

	it("coinUnits formats up to 8 fractional digits, no currency", () => {
		expect(coinUnits.format(0.12345678)).toBe("0.12345678");
		expect(coinUnits.format(1)).toBe("1");
	});
});

describe("formatPayoff", () => {
	it("returns em-dash for non-finite or non-positive months", () => {
		expect(formatPayoff(0)).toBe("—");
		expect(formatPayoff(-3)).toBe("—");
		expect(formatPayoff(Number.NaN)).toBe("—");
		expect(formatPayoff(Number.POSITIVE_INFINITY)).toBe("—");
	});

	it("under 12 months → ceiled month count", () => {
		expect(formatPayoff(3)).toBe("3 mo");
		expect(formatPayoff(3.2)).toBe("4 mo");
		expect(formatPayoff(11)).toBe("11 mo");
	});

	it("12 to <120 months → years with one decimal", () => {
		expect(formatPayoff(12)).toBe("1.0 yr");
		expect(formatPayoff(50)).toBe("4.2 yr");
	});

	it("120+ months → years rounded to integer", () => {
		expect(formatPayoff(120)).toBe("10 yr");
		expect(formatPayoff(360)).toBe("30 yr");
	});
});

describe("formatAnnualAs", () => {
	it("renders an annual figure in the chosen frequency unit", () => {
		expect(formatAnnualAs(52000, "weekly")).toBe("$1,000/w");
		expect(formatAnnualAs(12000, "monthly")).toBe("$1,000/mo");
		expect(formatAnnualAs(60000, "annually")).toBe("$60,000/y");
	});
});
