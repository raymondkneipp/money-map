import { HugeiconsIcon } from "@hugeicons/react";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CATEGORY_ICON } from "../nodes/expense-node";
import {
	EXPENSE_CATEGORIES,
	type ExpenseCategory,
	type ExpenseNodeData,
	FREQUENCIES,
	type Frequency,
} from "../types";
import { selectOnFocus } from "./select-on-focus";

export function ExpenseEditor({
	node,
	onChange,
}: {
	node: ExpenseNodeData;
	onChange: (id: string, data: Partial<ExpenseNodeData["data"]>) => void;
}) {
	const { id, data } = node;

	return (
		<div className="px-4 py-3">
			<h3 className="mb-3 text-sm font-semibold">Edit Expense</h3>
			<FieldGroup>
				<Field>
					<Label htmlFor={`expense-name-${id}`}>Name</Label>
					<Input
						id={`expense-name-${id}`}
						name="name"
						value={data.name}
						onChange={(e) => onChange(id, { name: e.target.value })}
					/>
				</Field>
				<Field>
					<Label htmlFor={`expense-amount-${id}`}>Amount</Label>
					<InputGroup>
						<InputGroupAddon>
							<InputGroupText>$</InputGroupText>
						</InputGroupAddon>
						<InputGroupInput
							id={`expense-amount-${id}`}
							name="amount"
							type="number"
							min={0}
							max={100_000}
							value={data.amount}
							onFocus={selectOnFocus}
							onChange={(e) => {
								const capped = Math.min(
									100_000,
									Math.max(0, Number(e.target.value)),
								);
								onChange(id, { amount: capped });
							}}
						/>
						<InputGroupAddon align="inline-end">
							<InputGroupText>USD</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
				</Field>
				<Field>
					<Label htmlFor={`expense-frequency-${id}`}>Frequency</Label>
					<Select
						value={data.frequency}
						onValueChange={(v) => onChange(id, { frequency: v as Frequency })}
					>
						<SelectTrigger id={`expense-frequency-${id}`}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{FREQUENCIES.map((f) => (
									<SelectItem key={f.id} value={f.id}>
										{f.label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</Field>
				<Field>
					<Label htmlFor={`expense-category-${id}`}>Category</Label>
					<Select
						value={data.category}
						onValueChange={(v) =>
							onChange(id, { category: v as ExpenseCategory })
						}
					>
						<SelectTrigger id={`expense-category-${id}`}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{EXPENSE_CATEGORIES.map((c) => (
									<SelectItem key={c.id} value={c.id}>
										<HugeiconsIcon
											icon={CATEGORY_ICON[c.id]}
											strokeWidth={2}
											className="size-3.5"
										/>
										{c.label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</Field>
			</FieldGroup>
		</div>
	);
}
