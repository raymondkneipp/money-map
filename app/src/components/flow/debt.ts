/**
 * Debt math: classify a debt's health based on incoming payment vs balance,
 * APR, and the user's stated minimum payment. Also estimates payoff time when
 * the payment is enough to make progress.
 */

export type DebtStatus =
	| {
			kind: "healthy";
			/** months to fully pay off at the current monthly payment */
			payoffMonths: number;
			monthlyInterest: number;
			monthlyPayment: number;
	  }
	| {
			kind: "below-minimum";
			/** how many dollars short of the minimum (per month) */
			shortfall: number;
			monthlyInterest: number;
			monthlyPayment: number;
	  }
	| {
			kind: "underwater";
			/** payment can't even cover monthly interest — balance grows */
			monthlyInterest: number;
			monthlyPayment: number;
	  }
	| { kind: "no-payment"; monthlyInterest: number };

/**
 * @param balance current debt balance (USD, > 0)
 * @param apr annual percentage rate (0-100)
 * @param monthlyPayment effective monthly payment from incoming edges
 * @param monthlyMinimum statement minimum (already converted to monthly)
 */
export function debtStatus(
	balance: number,
	apr: number,
	monthlyPayment: number,
	monthlyMinimum: number,
): DebtStatus {
	const r = apr / 100 / 12;
	const monthlyInterest = balance * r;

	if (monthlyPayment <= 0) {
		return { kind: "no-payment", monthlyInterest };
	}

	// Underwater: payment doesn't cover interest, balance never decreases
	if (monthlyPayment <= monthlyInterest + 1e-6) {
		return {
			kind: "underwater",
			monthlyInterest,
			monthlyPayment,
		};
	}

	// Below the user's stated minimum (but still making progress)
	if (monthlyPayment + 1e-6 < monthlyMinimum) {
		return {
			kind: "below-minimum",
			shortfall: monthlyMinimum - monthlyPayment,
			monthlyInterest,
			monthlyPayment,
		};
	}

	// Healthy — closed-form payoff: -ln(1 - rB/P) / ln(1+r)
	// Falls back to simple division when r ≈ 0 (zero-interest debt).
	let payoffMonths: number;
	if (r < 1e-9) {
		payoffMonths = balance / monthlyPayment;
	} else {
		payoffMonths =
			-Math.log(1 - (r * balance) / monthlyPayment) / Math.log(1 + r);
	}

	return {
		kind: "healthy",
		payoffMonths,
		monthlyInterest,
		monthlyPayment,
	};
}

export function formatPayoff(months: number): string {
	if (!Number.isFinite(months) || months <= 0) return "—";
	if (months < 12) return `${Math.ceil(months)} mo`;
	const years = months / 12;
	if (years < 10) return `${years.toFixed(1)} yr`;
	return `${Math.round(years)} yr`;
}
