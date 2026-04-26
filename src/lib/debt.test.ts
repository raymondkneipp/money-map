import { describe, expect, it } from "vitest";
import { debtStatus } from "./debt";

describe("debtStatus", () => {
	it("returns 'no-payment' when monthlyPayment <= 0", () => {
		const s = debtStatus(1000, 20, 0, 50);
		expect(s.kind).toBe("no-payment");
		expect(s.monthlyInterest).toBeCloseTo((1000 * 20) / 100 / 12);
	});

	it("returns 'underwater' when payment can't cover interest", () => {
		// $10k @ 24% APR → $200/mo interest. $100 payment is underwater.
		const s = debtStatus(10000, 24, 100, 100);
		expect(s.kind).toBe("underwater");
	});

	it("returns 'below-minimum' when payment > interest but < min", () => {
		// $1k @ 12% APR → $10/mo interest. $50 payment, $200 min.
		const s = debtStatus(1000, 12, 50, 200);
		expect(s.kind).toBe("below-minimum");
		if (s.kind === "below-minimum") {
			expect(s.shortfall).toBe(150);
		}
	});

	it("returns 'healthy' with closed-form payoff for normal debt", () => {
		const s = debtStatus(1000, 12, 100, 25);
		expect(s.kind).toBe("healthy");
		if (s.kind === "healthy") {
			// Should pay off in roughly 11 months at $100/mo on $1k @ 12%.
			expect(s.payoffMonths).toBeGreaterThan(10);
			expect(s.payoffMonths).toBeLessThan(12);
		}
	});

	it("falls back to simple division when APR is ~0", () => {
		const s = debtStatus(1200, 0, 100, 25);
		expect(s.kind).toBe("healthy");
		if (s.kind === "healthy") {
			expect(s.payoffMonths).toBe(12);
		}
	});
});
