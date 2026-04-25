import type { Edge, Node } from "@xyflow/react";
import type {
	AllocationEdgeData,
	AssetNodeData,
	CheckingNodeData,
	DebtNodeData,
	ExpenseNodeData,
	IncomeNodeData,
	RetirementNodeData,
	SavingsNodeData,
} from "./types";

const incomeNodes: IncomeNodeData[] = [
	{
		id: "income-salary",
		position: { x: 0, y: 120 },
		data: {
			name: "Salary",
			amount: 6500,
			frequency: "monthly",
			passive: false,
		},
		type: "incomeNode",
	},
	{
		id: "income-freelance",
		position: { x: 0, y: 360 },
		data: {
			name: "Side gig",
			amount: 1200,
			frequency: "monthly",
			passive: false,
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

const retirementNodes: RetirementNodeData[] = [
	{
		id: "retirement-401k",
		position: { x: 360, y: -80 },
		data: { name: "401(k)", principal: 42000, apy: 7, employerMatch: 50 },
		type: "retirementNode",
	},
];

const savingsNodes: SavingsNodeData[] = [
	{
		id: "savings-emergency",
		position: { x: 760, y: 140 },
		data: { name: "Emergency fund", principal: 12500, apy: 4.25 },
		type: "savingsNode",
	},
];

const assetNodes: AssetNodeData[] = [
	{
		id: "asset-ira",
		position: { x: 760, y: -220 },
		data: { name: "Roth IRA", assetType: "ira", principal: 18500, apy: 7 },
		type: "assetNode",
	},
	{
		id: "asset-brokerage",
		position: { x: 760, y: -40 },
		data: {
			name: "Brokerage",
			assetType: "brokerage",
			principal: 9500,
			apy: 8,
		},
		type: "assetNode",
	},
];

const debtNodes: DebtNodeData[] = [
	{
		id: "debt-credit-card",
		position: { x: 760, y: 320 },
		data: {
			name: "Credit card",
			debtType: "creditCard",
			principal: 3200,
			apr: 22,
			minimumPayment: 80,
			minimumFrequency: "monthly",
		},
		type: "debtNode",
	},
	{
		id: "debt-student-loan",
		position: { x: 760, y: 500 },
		data: {
			name: "Student loan",
			debtType: "studentLoan",
			principal: 22000,
			apr: 5.5,
			minimumPayment: 280,
			minimumFrequency: "monthly",
		},
		type: "debtNode",
	},
];

const expenseNodes: ExpenseNodeData[] = [
	{
		id: "expense-rent",
		position: { x: 1100, y: -220 },
		data: {
			name: "Rent",
			amount: 1900,
			frequency: "monthly",
			category: "housing",
		},
		type: "expenseNode",
	},
	{
		id: "expense-groceries",
		position: { x: 1100, y: -80 },
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
		position: { x: 1100, y: 60 },
		data: {
			name: "Utilities",
			amount: 180,
			frequency: "monthly",
			category: "utilities",
		},
		type: "expenseNode",
	},
	{
		id: "expense-transport",
		position: { x: 1100, y: 200 },
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
		position: { x: 1100, y: 340 },
		data: {
			name: "Insurance",
			amount: 200,
			frequency: "monthly",
			category: "insurance",
		},
		type: "expenseNode",
	},
	{
		id: "expense-streaming",
		position: { x: 1100, y: 480 },
		data: {
			name: "Streaming",
			amount: 35,
			frequency: "monthly",
			category: "entertainment",
		},
		type: "expenseNode",
	},
];

export const initialNodes: Node[] = [
	...incomeNodes,
	...checkingNodes,
	...retirementNodes,
	...savingsNodes,
	...assetNodes,
	...debtNodes,
	...expenseNodes,
];

export const initialEdges: Edge[] = [
	// salary 6% → 401(k), remainder to checking
	{
		id: "salary-401k",
		source: "income-salary",
		target: "retirement-401k",
		type: "allocation",
		data: { mode: "percent", percent: 6 } satisfies AllocationEdgeData,
	},
	{
		id: "salary-checking",
		source: "income-salary",
		target: "checking-main",
		type: "allocation",
		data: { mode: "remainder" } satisfies AllocationEdgeData,
	},
	// side gig fully into checking
	{
		id: "freelance-checking",
		source: "income-freelance",
		target: "checking-main",
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
		id: "checking-streaming",
		source: "checking-main",
		target: "expense-streaming",
		type: "expense",
	},
	// checking → savings, $400/mo
	{
		id: "checking-savings",
		source: "checking-main",
		target: "savings-emergency",
		type: "allocation",
		data: {
			mode: "fixed",
			amount: 400,
			frequency: "monthly",
		} satisfies AllocationEdgeData,
	},
	// checking → IRA, $500/mo
	{
		id: "checking-ira",
		source: "checking-main",
		target: "asset-ira",
		type: "allocation",
		data: {
			mode: "fixed",
			amount: 500,
			frequency: "monthly",
		} satisfies AllocationEdgeData,
	},
	// checking → brokerage, $400/mo
	{
		id: "checking-brokerage",
		source: "checking-main",
		target: "asset-brokerage",
		type: "allocation",
		data: {
			mode: "fixed",
			amount: 400,
			frequency: "monthly",
		} satisfies AllocationEdgeData,
	},
	// checking → credit card payoff, $200/mo (above $80 min)
	{
		id: "checking-credit-card",
		source: "checking-main",
		target: "debt-credit-card",
		type: "allocation",
		data: {
			mode: "fixed",
			amount: 200,
			frequency: "monthly",
		} satisfies AllocationEdgeData,
	},
	// checking → student loan, $320/mo (above $280 min)
	{
		id: "checking-student-loan",
		source: "checking-main",
		target: "debt-student-loan",
		type: "allocation",
		data: {
			mode: "fixed",
			amount: 320,
			frequency: "monthly",
		} satisfies AllocationEdgeData,
	},
];
