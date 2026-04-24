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
		id: "income1",
		position: { x: 0, y: 100 },
		data: {
			name: "Income 1",
			amount: 1000,
			frequency: "monthly",
			passive: false,
		},
		type: "incomeNode",
	},
	{
		id: "income2",
		position: { x: 0, y: 260 },
		data: {
			name: "Income 2",
			amount: 2000,
			frequency: "monthly",
			passive: true,
		},
		type: "incomeNode",
	},
];

const checkingNodes: CheckingNodeData[] = [
	{
		id: "checking1",
		position: { x: 350, y: 180 },
		data: { name: "Checking", principal: 2500, apy: 0 },
		type: "checkingNode",
	},
];

const savingsNodes: SavingsNodeData[] = [
	{
		id: "savings1",
		position: { x: 700, y: 180 },
		data: { name: "Savings", principal: 10000, apy: 4.0 },
		type: "savingsNode",
	},
];

const cryptoNodes: CryptoNodeData[] = [
	{
		id: "crypto1",
		position: { x: 700, y: 540 },
		data: {
			name: "BTC",
			coin: "bitcoin",
			principal: 0.05,
			growthProfile: "moderate",
		},
		type: "cryptoNode",
	},
];

const expenseNodes: ExpenseNodeData[] = [
	{
		id: "expense1",
		position: { x: 700, y: 0 },
		data: {
			name: "Rent",
			amount: 1200,
			frequency: "monthly",
			category: "housing",
		},
		type: "expenseNode",
	},
	{
		id: "expense2",
		position: { x: 700, y: 360 },
		data: {
			name: "Groceries",
			amount: 400,
			frequency: "monthly",
			category: "food",
		},
		type: "expenseNode",
	},
];

export const initialNodes: Node[] = [
	{
		id: "n2",
		position: { x: 300, y: -100 },
		data: { label: "Node 2" },
		type: "baseNodeFull",
	},
	...incomeNodes,
	...checkingNodes,
	...savingsNodes,
	...expenseNodes,
	...cryptoNodes,
];

export const initialEdges: Edge[] = [
	{
		id: "income1-checking1",
		source: "income1",
		target: "checking1",
		type: "allocation",
		data: { mode: "percent", percent: 50 } satisfies AllocationEdgeData,
	},
	{
		id: "income2-checking1",
		source: "income2",
		target: "checking1",
		type: "allocation",
		data: {
			mode: "fixed",
			amount: 500,
			frequency: "monthly",
		} satisfies AllocationEdgeData,
	},
];
