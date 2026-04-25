import type { Edge, Node } from "@xyflow/react";

export const FREQUENCIES = [
	{ id: "daily", label: "Daily", abbr: "d", perYear: 365 },
	{ id: "weekly", label: "Weekly", abbr: "w", perYear: 52 },
	{ id: "biweekly", label: "Biweekly", abbr: "bw", perYear: 26 },
	{ id: "semimonthly", label: "Semi-monthly", abbr: "sm", perYear: 24 },
	{ id: "monthly", label: "Monthly", abbr: "mo", perYear: 12 },
	{ id: "quarterly", label: "Quarterly", abbr: "q", perYear: 4 },
	{ id: "semiannually", label: "Semi-annually", abbr: "sa", perYear: 2 },
	{ id: "annually", label: "Annually", abbr: "y", perYear: 1 },
] as const;

export type FrequencyRecord = (typeof FREQUENCIES)[number];
export type Frequency = FrequencyRecord["id"];

export const FREQUENCY_BY_ID = Object.fromEntries(
	FREQUENCIES.map((f) => [f.id, f]),
) as Record<Frequency, FrequencyRecord>;

export type IncomeNodeData = Node<{
	name: string;
	amount: number;
	frequency: Frequency;
	passive: boolean;
}>;

export type CheckingNodeData = Node<{
	name: string;
	/** current balance in USD */
	principal: number;
	/** annual percentage yield, 0-100 */
	apy: number;
}>;

export type SavingsNodeData = Node<{
	name: string;
	/** current balance in USD */
	principal: number;
	/** annual percentage yield, 0-100 */
	apy: number;
}>;

export const CRYPTO_COINS = [
	{ id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
	{ id: "ethereum", symbol: "ETH", name: "Ethereum" },
	{ id: "tether", symbol: "USDT", name: "Tether" },
	{ id: "binancecoin", symbol: "BNB", name: "BNB" },
	{ id: "solana", symbol: "SOL", name: "Solana" },
	{ id: "ripple", symbol: "XRP", name: "XRP" },
	{ id: "usd-coin", symbol: "USDC", name: "USD Coin" },
	{ id: "cardano", symbol: "ADA", name: "Cardano" },
	{ id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
	{ id: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
] as const;

export type CryptoCoinId = (typeof CRYPTO_COINS)[number]["id"];

export const CRYPTO_GROWTH_PROFILES = [
	{ id: "conservative", label: "Conservative", apy: 5 },
	{ id: "moderate", label: "Moderate", apy: 15 },
	{ id: "aggressive", label: "Aggressive", apy: 30 },
] as const;

export type CryptoGrowthProfile = (typeof CRYPTO_GROWTH_PROFILES)[number]["id"];

export type CryptoNodeData = Node<{
	name: string;
	coin: CryptoCoinId;
	/** current holdings in coin units (not USD) */
	principal: number;
	growthProfile: CryptoGrowthProfile;
}>;

export type IRANodeData = Node<{
	name: string;
	/** current balance in USD */
	principal: number;
	/** annual percentage return, 0-100 */
	apy: number;
}>;

export type BrokerageNodeData = Node<{
	name: string;
	/** current balance in USD */
	principal: number;
	/** annual percentage return, 0-100 */
	apy: number;
}>;

export type OtherAssetNodeData = Node<{
	name: string;
	/** current balance in USD */
	principal: number;
	/** annual percentage return, 0-100 */
	apy: number;
}>;

export type RetirementNodeData = Node<{
	name: string;
	/** current balance in USD */
	principal: number;
	/** annual percentage return, 0-100 */
	apy: number;
	/** employer match as a percent of employee contribution, 0-100 */
	employerMatch: number;
}>;

export const EXPENSE_CATEGORIES = [
	{ id: "housing", label: "Housing" },
	{ id: "food", label: "Food" },
	{ id: "transport", label: "Transport" },
	{ id: "utilities", label: "Utilities" },
	{ id: "healthcare", label: "Healthcare" },
	{ id: "entertainment", label: "Entertainment" },
	{ id: "insurance", label: "Insurance" },
	{ id: "personal", label: "Personal" },
	{ id: "other", label: "Other" },
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]["id"];

export type ExpenseNodeData = Node<{
	name: string;
	amount: number;
	frequency: Frequency;
	category: ExpenseCategory;
}>;

export type AllocationMode = "percent" | "fixed" | "remainder";

export type AllocationEdgeData = {
	mode: AllocationMode;
	/** used when mode === "percent"; 0-100 */
	percent?: number;
	/** used when mode === "fixed" */
	amount?: number;
	/** used when mode === "fixed" */
	frequency?: Frequency;
};

export type AllocationEdge = Edge<AllocationEdgeData, "allocation">;

export function toAnnual(amount: number, frequency: Frequency): number {
	return amount * FREQUENCY_BY_ID[frequency].perYear;
}
