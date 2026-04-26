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
import { Switch } from "@/components/ui/switch";
import { FREQUENCIES, type Frequency, type IncomeNodeData } from "../types";
import { selectOnFocus } from "./select-on-focus";

export function IncomeEditor({
	node,
	onChange,
}: {
	node: IncomeNodeData;
	onChange: (id: string, data: Partial<IncomeNodeData["data"]>) => void;
}) {
	const { id, data } = node;

	return (
		<div className="px-4 py-3">
			<h3 className="mb-3 text-sm font-semibold">Edit Income</h3>
			<FieldGroup>
				<Field>
					<Label htmlFor={`sidebar-name-${id}`}>Name</Label>
					<Input
						id={`sidebar-name-${id}`}
						name="name"
						value={data.name}
						onChange={(e) => onChange(id, { name: e.target.value })}
					/>
				</Field>
				<Field>
					<Label htmlFor={`sidebar-amount-${id}`}>Amount</Label>
					<InputGroup>
						<InputGroupAddon>
							<InputGroupText>$</InputGroupText>
						</InputGroupAddon>
						<InputGroupInput
							placeholder="0.00"
							id={`sidebar-amount-${id}`}
							name="amount"
							value={data.amount}
							type="number"
							min={0}
							max={100_000}
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
					<Label htmlFor={`sidebar-frequency-${id}`}>Frequency</Label>
					<Select
						value={data.frequency}
						onValueChange={(value) =>
							onChange(id, { frequency: value as Frequency })
						}
					>
						<SelectTrigger id={`sidebar-frequency-${id}`}>
							<SelectValue placeholder="Frequency" />
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
					<div className="flex items-center justify-between">
						<div>
							<Label htmlFor={`sidebar-passive-${id}`}>Passive</Label>
							<p className="text-xs text-muted-foreground">
								Continues after retirement
							</p>
						</div>
						<Switch
							id={`sidebar-passive-${id}`}
							checked={data.passive}
							onCheckedChange={(checked) => onChange(id, { passive: checked })}
						/>
					</div>
				</Field>
			</FieldGroup>
		</div>
	);
}
