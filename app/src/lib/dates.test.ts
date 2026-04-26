import { describe, expect, it } from "vitest";
import {
	ageInYears,
	dateForMonthOffset,
	formatISODate,
	formatMonthYear,
	parseISODate,
	startOfThisMonth,
} from "./dates";

describe("parseISODate / formatISODate", () => {
	it("round-trips an ISO date string", () => {
		const d = parseISODate("1990-05-15");
		expect(d).toBeDefined();
		expect(formatISODate(d as Date)).toBe("1990-05-15");
	});

	it("returns undefined for invalid input", () => {
		expect(parseISODate("not-a-date")).toBeUndefined();
		expect(parseISODate("")).toBeUndefined();
	});
});

describe("ageInYears", () => {
	it("returns whole years between birthDate string and reference", () => {
		expect(ageInYears("1990-01-15", new Date(2020, 0, 15))).toBe(30);
		expect(ageInYears("1990-01-15", new Date(2020, 0, 14))).toBe(29);
		expect(ageInYears("1990-01-15", new Date(2020, 0, 16))).toBe(30);
	});

	it("returns 0 for invalid input", () => {
		expect(ageInYears("not-a-date", new Date(2020, 0, 1))).toBe(0);
	});
});

describe("startOfThisMonth", () => {
	it("returns midnight on the 1st of the current month", () => {
		const d = startOfThisMonth();
		expect(d.getDate()).toBe(1);
		expect(d.getHours()).toBe(0);
		expect(d.getMinutes()).toBe(0);
	});
});

describe("dateForMonthOffset", () => {
	it("adds the offset in months", () => {
		const start = new Date(2025, 0, 1); // Jan 2025
		expect(dateForMonthOffset(start, 0)).toEqual(start);
		expect(dateForMonthOffset(start, 12).getFullYear()).toBe(2026);
		expect(dateForMonthOffset(start, 13).getMonth()).toBe(1);
	});
});

describe("formatMonthYear", () => {
	it("renders 'Mon YYYY' style", () => {
		expect(formatMonthYear(new Date(2027, 3, 1))).toBe("Apr 2027");
	});
});
