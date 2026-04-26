import type { Edge, Node } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import type { NodeSeries } from "./node-projection";
import { buildStats } from "./node-stats";

const today = new Date(2026, 0, 1); // Jan 2026

function series(
	label: string,
	points: NodeSeries["points"],
	stepped = false,
): NodeSeries {
	return { label, stepped, points };
}

const TAIL = series("Cumulative", [
	{ month: 0, value: 0 },
	{ month: 12, value: 12000 },
]);

describe("buildStats — income node", () => {
	it("returns Monthly + Annual + headline tiles", () => {
		const node: Node = {
			id: "inc",
			type: "incomeNode",
			position: { x: 0, y: 0 },
			data: { name: "Salary", amount: 1000, frequency: "monthly", passive: false },
		} as never;
		const stats = buildStats(node, [node], [], {}, TAIL, today);
		expect(stats.map((s) => s.label)).toEqual([
			"Monthly",
			"Annual",
			"Cumulative",
		]);
		expect(stats[0].value).toBe("$1,000");
		expect(stats[1].value).toBe("$12,000");
	});
});

describe("buildStats — expense node", () => {
	it("matches the income-node shape with Monthly + Annual", () => {
		const node: Node = {
			id: "rent",
			type: "expenseNode",
			position: { x: 0, y: 0 },
			data: {
				name: "Rent",
				amount: 2000,
				frequency: "monthly",
				category: "housing",
			},
		} as never;
		const stats = buildStats(node, [node], [], {}, TAIL, today);
		expect(stats[0]).toEqual({ label: "Monthly", value: "$2,000" });
		expect(stats[1]).toEqual({ label: "Annual", value: "$24,000" });
	});
});

describe("buildStats — debt node", () => {
	it("shows Beyond horizon when series never crosses zero", () => {
		const node: Node = {
			id: "card",
			type: "debtNode",
			position: { x: 0, y: 0 },
			data: {
				name: "Card",
				debtType: "creditCard",
				principal: 5000,
				apr: 24,
				minimumPayment: 100,
				minimumFrequency: "monthly",
			},
		} as never;
		const s = series("Balance", [
			{ month: 0, value: 5000 },
			{ month: 12, value: 4500 },
		]);
		const stats = buildStats(node, [node], [], {}, s, today);
		expect(stats.map((x) => x.label)).toEqual([
			"Balance",
			"Monthly payment",
			"APR",
			"Payoff",
			"Balance",
		]);
		expect(stats[0].value).toBe("$5,000");
		expect(stats[2].value).toBe("24%");
		expect(stats[3].value).toBe("Beyond horizon");
	});

	it("formats payoff month as Mon YYYY when balance hits zero", () => {
		const node: Node = {
			id: "card",
			type: "debtNode",
			position: { x: 0, y: 0 },
			data: {
				name: "Card",
				debtType: "creditCard",
				principal: 1000,
				apr: 12,
				minimumPayment: 200,
				minimumFrequency: "monthly",
			},
		} as never;
		const s = series("Balance", [
			{ month: 0, value: 1000 },
			{ month: 6, value: 0 },
		]);
		const stats = buildStats(node, [node], [], {}, s, today);
		// today = Jan 2026, +6 months → Jul 2026
		expect(stats[3]).toEqual({ label: "Payoff", value: "Jul 2026" });
	});
});

describe("buildStats — checking/savings/emergency nodes", () => {
	it("shows Today / Monthly in / Monthly out / APY / Projected", () => {
		const node: Node = {
			id: "chk",
			type: "checkingNode",
			position: { x: 0, y: 0 },
			data: { name: "Checking", principal: 500, apy: 1 },
		} as never;
		const s = series("Balance", [
			{ month: 0, value: 500 },
			{ month: 12, value: 800 },
		]);
		const stats = buildStats(node, [node], [], {}, s, today);
		expect(stats.map((x) => x.label)).toEqual([
			"Today",
			"Monthly in",
			"Monthly out",
			"APY",
			"Projected",
		]);
		expect(stats[0].value).toBe("$500");
		expect(stats[3].value).toBe("1%");
		expect(stats[4].value).toBe("$800");
	});
});

describe("buildStats — retirement / asset nodes", () => {
	it("returns Today / Monthly contribution / APY / Projected", () => {
		const node: Node = {
			id: "ret",
			type: "retirementNode",
			position: { x: 0, y: 0 },
			data: { name: "401k", principal: 50000, apy: 7, employerMatch: 0 },
		} as never;
		const s = series("Balance", [
			{ month: 0, value: 50000 },
			{ month: 12, value: 53500 },
		]);
		const stats = buildStats(node, [node], [], {}, s, today);
		expect(stats.map((x) => x.label)).toEqual([
			"Today",
			"Monthly contribution",
			"APY",
			"Projected",
		]);
		expect(stats[2].value).toBe("7%");
	});
});

describe("buildStats — crypto node", () => {
	it("uses coin units, current price, growth APY, and projected USD value", () => {
		const node: Node = {
			id: "btc",
			type: "cryptoNode",
			position: { x: 0, y: 0 },
			data: {
				name: "Bitcoin",
				coin: "bitcoin",
				principal: 0.5,
				growthProfile: "moderate",
			},
		} as never;
		const prices = { bitcoin: 60000 };
		const s = series("Balance", [
			{ month: 0, value: 30000 },
			{ month: 12, value: 34500 },
		]);
		const stats = buildStats(node, [node], [], prices, s, today);
		expect(stats.map((x) => x.label)).toEqual([
			"Holdings",
			"Price",
			"Today (USD)",
			"Growth",
			"Projected",
		]);
		expect(stats[0].value).toBe("0.5 BTC");
		expect(stats[1].value).toBe("$60,000");
		expect(stats[2].value).toBe("$30,000");
		expect(stats[3].value).toBe("15%"); // moderate profile APY
	});

	it("falls back gracefully when price is missing", () => {
		const node: Node = {
			id: "eth",
			type: "cryptoNode",
			position: { x: 0, y: 0 },
			data: {
				name: "Ether",
				coin: "ethereum",
				principal: 1,
				growthProfile: "conservative",
			},
		} as never;
		const stats = buildStats(node, [node], [], {}, TAIL, today);
		expect(stats[1].value).toBe("$0");
		expect(stats[3].value).toBe("5%");
	});
});

describe("buildStats — fallback", () => {
	it("returns just the headline tile for unknown node types", () => {
		const node: Node = {
			id: "?",
			type: "unknownNode",
			position: { x: 0, y: 0 },
			data: {},
		} as never;
		const s = series("Balance", [{ month: 0, value: 42 }]);
		const stats = buildStats(node, [node], [] as Edge[], {}, s, today);
		expect(stats).toEqual([{ label: "Balance", value: "$42" }]);
	});

	it("prefers `readout` over `value` when present in the last point", () => {
		const node: Node = {
			id: "?",
			type: "unknownNode",
			position: { x: 0, y: 0 },
			data: {},
		} as never;
		const s = series("Total", [{ month: 0, value: 100, readout: 999 }]);
		const stats = buildStats(node, [node], [], {}, s, today);
		expect(stats[0].value).toBe("$999");
	});
});
