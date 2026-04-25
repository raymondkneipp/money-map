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
import { DEBT_TYPE_ICON } from "../nodes/debt-node";
import {
	DEBT_TYPES,
	type DebtNodeData,
	type DebtType,
	FREQUENCIES,
	type Frequency,
} from "../types";
import { selectOnFocus } from "./select-on-focus";

export function DebtEditor({
	node,
	onChange,
}: {
	node: DebtNodeData;
	onChange: (id: string, data: Partial<DebtNodeData["data"]>) => void;
}) {
	const { id, data } = node;

	return (
		<div className="px-4 py-3">
			<h3 className="mb-3 text-sm font-semibold">Edit Debt</h3>
			<FieldGroup>
				<Field>
					<Label htmlFor={`debt-name-${id}`}>Name</Label>
					<Input
						id={`debt-name-${id}`}
						value={data.name}
						onChange={(e) => onChange(id, { name: e.target.value })}
					/>
				</Field>
				<Field>
					<Label htmlFor={`debt-type-${id}`}>Type</Label>
					<Select
						value={data.debtType}
						onValueChange={(v) => onChange(id, { debtType: v as DebtType })}
					>
						<SelectTrigger id={`debt-type-${id}`}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{DEBT_TYPES.map((t) => (
									<SelectItem key={t.id} value={t.id}>
										<HugeiconsIcon
											icon={DEBT_TYPE_ICON[t.id]}
											strokeWidth={2}
											className="size-3.5"
										/>
										{t.label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</Field>
				<Field>
					<Label htmlFor={`debt-principal-${id}`}>Current balance</Label>
					<InputGroup>
						<InputGroupAddon>
							<InputGroupText>$</InputGroupText>
						</InputGroupAddon>
						<InputGroupInput
							id={`debt-principal-${id}`}
							type="number"
							min={0}
							max={10_000_000}
							step="0.01"
							value={data.principal}
							onFocus={selectOnFocus}
							onChange={(e) =>
								onChange(id, {
									principal: Math.max(0, Number(e.target.value)),
								})
							}
						/>
					</InputGroup>
				</Field>
				<Field>
					<Label htmlFor={`debt-apr-${id}`}>APR</Label>
					<InputGroup>
						<InputGroupInput
							id={`debt-apr-${id}`}
							type="number"
							min={0}
							max={100}
							step="0.01"
							value={data.apr}
							onFocus={selectOnFocus}
							onChange={(e) =>
								onChange(id, {
									apr: Math.min(100, Math.max(0, Number(e.target.value))),
								})
							}
						/>
						<InputGroupAddon align="inline-end">
							<InputGroupText>%</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
				</Field>
				<Field>
					<Label htmlFor={`debt-min-${id}`}>Minimum payment</Label>
					<InputGroup>
						<InputGroupAddon>
							<InputGroupText>$</InputGroupText>
						</InputGroupAddon>
						<InputGroupInput
							id={`debt-min-${id}`}
							type="number"
							min={0}
							max={1_000_000}
							step="0.01"
							value={data.minimumPayment}
							onFocus={selectOnFocus}
							onChange={(e) =>
								onChange(id, {
									minimumPayment: Math.max(0, Number(e.target.value)),
								})
							}
						/>
					</InputGroup>
				</Field>
				<Field>
					<Label htmlFor={`debt-min-frequency-${id}`}>Minimum frequency</Label>
					<Select
						value={data.minimumFrequency}
						onValueChange={(v) =>
							onChange(id, { minimumFrequency: v as Frequency })
						}
					>
						<SelectTrigger id={`debt-min-frequency-${id}`}>
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
			</FieldGroup>
		</div>
	);
}
