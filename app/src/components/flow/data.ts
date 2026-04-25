import type { Edge, Node } from "@xyflow/react";
import type {
	AllocationEdgeData,
	CheckingNodeData,
	CryptoNodeData,
	ExpenseNodeData,
	IncomeNodeData,
	SavingsNodeData,
} from "./types";

const incomeNodes: IncomeNodeData[] = [
	{
		id: "income-salary",
		position: { x: 0, y: 60 },
		data: {
			name: "Salary",
			amount: 5200,
			frequency: "monthly",
			passive: false,
		},
		type: "incomeNode",
	},
	{
		id: "income-freelance",
		position: { x: 0, y: 240 },
		data: {
			name: "Freelance",
			amount: 800,
			frequency: "monthly",
			passive: false,
		},
		type: "incomeNode",
	},
	{
		id: "income-dividends",
		position: { x: 0, y: 420 },
		data: {
			name: "Dividends",
			amount: 140,
			frequency: "monthly",
			passive: true,
		},
		type: "incomeNode",
	},
];

const checkingNodes: CheckingNodeData[] = [
	{
		id: "checking-main",
		position: { x: 360, y: 240 },
		data: { name: "Checking", principal: 4200, apy: 0 },
		type: "checkingNode",
	},
];

const savingsNodes: SavingsNodeData[] = [
	{
		id: "savings-emergency",
		position: { x: 760, y: 720 },
		data: { name: "Emergency fund", principal: 12500, apy: 4.25 },
		type: "savingsNode",
	},
];

const cryptoNodes: CryptoNodeData[] = [
	{
		id: "crypto-btc",
		position: { x: 760, y: 900 },
		data: {
			name: "Bitcoin",
			coin: "bitcoin",
			principal: 0.08,
			growthProfile: "moderate",
		},
		type: "cryptoNode",
	},
];

const expenseNodes: ExpenseNodeData[] = [
	{
		id: "expense-rent",
		position: { x: 760, y: -120 },
		data: {
			name: "Rent",
			amount: 1800,
			frequency: "monthly",
			category: "housing",
		},
		type: "expenseNode",
	},
	{
		id: "expense-groceries",
		position: { x: 760, y: 60 },
		data: {
			name: "Groceries",
			amount: 480,
			frequency: "monthly",
			category: "food",
		},
		type: "expenseNode",
	},
	{
		id: "expense-utilities",
		position: { x: 760, y: 200 },
		data: {
			name: "Utilities",
			amount: 160,
			frequency: "monthly",
			category: "utilities",
		},
		type: "expenseNode",
	},
	{
		id: "expense-transport",
		position: { x: 760, y: 320 },
		data: {
			name: "Transit + gas",
			amount: 140,
			frequency: "monthly",
			category: "transport",
		},
		type: "expenseNode",
	},
	{
		id: "expense-insurance",
		position: { x: 760, y: 440 },
		data: {
			name: "Insurance",
			amount: 220,
			frequency: "monthly",
			category: "insurance",
		},
		type: "expenseNode",
	},
	{
		id: "expense-healthcare",
		position: { x: 760, y: 560 },
		data: {
			name: "Healthcare",
			amount: 90,
			frequency: "monthly",
			category: "healthcare",
		},
		type: "expenseNode",
	},
	{
		id: "expense-streaming",
		position: { x: 1100, y: -120 },
		data: {
			name: "Streaming",
			amount: 45,
			frequency: "monthly",
			category: "entertainment",
		},
		type: "expenseNode",
	},
	{
		id: "expense-personal",
		position: { x: 1100, y: 60 },
		data: {
			name: "Personal",
			amount: 180,
			frequency: "monthly",
			category: "personal",
		},
		type: "expenseNode",
	},
	{
		id: "expense-gym",
		position: { x: 1100, y: 200 },
		data: {
			name: "Gym",
			amount: 40,
			frequency: "monthly",
			category: "personal",
		},
		type: "expenseNode",
	},
];

export const initialNodes: Node[] = [
	...incomeNodes,
	...checkingNodes,
	...savingsNodes,
	...cryptoNodes,
	...expenseNodes,
];

export const initialEdges: Edge[] = [
	// salary → 10% to savings, rest to checking
	{
		id: "salary-savings",
		source: "income-salary",
		target: "savings-emergency",
		type: "allocation",
		data: { mode: "percent", percent: 10 } satisfies AllocationEdgeData,
	},
	{
		id: "salary-checking",
		source: "income-salary",
		target: "checking-main",
		type: "allocation",
		data: { mode: "remainder" } satisfies AllocationEdgeData,
	},
	// freelance fully into checking
	{
		id: "freelance-checking",
		source: "income-freelance",
		target: "checking-main",
		type: "allocation",
		data: { mode: "remainder" } satisfies AllocationEdgeData,
	},
	// dividends fully into savings
	{
		id: "dividends-savings",
		source: "income-dividends",
		target: "savings-emergency",
		type: "allocation",
		data: { mode: "remainder" } satisfies AllocationEdgeData,
	},
	// checking → expenses
	{
		id: "checking-rent",
		source: "checking-main",
		target: "expense-rent",
		type: "expense",
	},
	{
		id: "checking-groceries",
		source: "checking-main",
		target: "expense-groceries",
		type: "expense",
	},
	{
		id: "checking-utilities",
		source: "checking-main",
		target: "expense-utilities",
		type: "expense",
	},
	{
		id: "checking-transport",
		source: "checking-main",
		target: "expense-transport",
		type: "expense",
	},
	{
		id: "checking-insurance",
		source: "checking-main",
		target: "expense-insurance",
		type: "expense",
	},
	{
		id: "checking-healthcare",
		source: "checking-main",
		target: "expense-healthcare",
		type: "expense",
	},
	{
		id: "checking-streaming",
		source: "checking-main",
		target: "expense-streaming",
		type: "expense",
	},
	{
		id: "checking-personal",
		source: "checking-main",
		target: "expense-personal",
		type: "expense",
	},
	{
		id: "checking-gym",
		source: "checking-main",
		target: "expense-gym",
		type: "expense",
	},
	// checking → crypto, $100/mo dollar-cost average
	{
		id: "checking-btc",
		source: "checking-main",
		target: "crypto-btc",
		type: "allocation",
		data: {
			mode: "fixed",
			amount: 100,
			frequency: "monthly",
		} satisfies AllocationEdgeData,
	},
];
