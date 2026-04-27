import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import type { EmergencyFundNodeData } from "../types";
import { selectOnFocus } from "./select-on-focus";

export function EmergencyFundEditor({
	node,
	onChange,
}: {
	node: EmergencyFundNodeData;
	onChange: (id: string, data: Partial<EmergencyFundNodeData["data"]>) => void;
}) {
	const { id, data } = node;

	return (
		<div className="px-4 py-3">
			<h3 className="mb-3 text-sm font-semibold">Edit Emergency Fund</h3>
			<FieldGroup>
				<Field>
					<Label htmlFor={`emergency-name-${id}`}>Name</Label>
					<Input
						id={`emergency-name-${id}`}
						name="name"
						value={data.name}
						onChange={(e) => onChange(id, { name: e.target.value })}
					/>
				</Field>
				<Field>
					<Label htmlFor={`emergency-principal-${id}`}>Current balance</Label>
					<InputGroup>
						<InputGroupAddon>
							<InputGroupText>$</InputGroupText>
						</InputGroupAddon>
						<InputGroupInput
							id={`emergency-principal-${id}`}
							name="principal"
							type="number"
							min={0}
							max={10_000_000}
							step={0.01}
							value={data.principal}
							onFocus={selectOnFocus}
							onChange={(e) => {
								const capped = Math.min(
									10_000_000,
									Math.max(0, Number(e.target.value)),
								);
								onChange(id, { principal: capped });
							}}
						/>
						<InputGroupAddon align="inline-end">
							<InputGroupText>USD</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
				</Field>
				<Field>
					<Label htmlFor={`emergency-target-${id}`}>
						Target (months of expenses)
					</Label>
					<InputGroup>
						<InputGroupInput
							id={`emergency-target-${id}`}
							name="targetMonths"
							type="number"
							inputMode="numeric"
							min={1}
							max={24}
							step={1}
							value={data.targetMonths}
							onFocus={selectOnFocus}
							onChange={(e) => {
								const capped = Math.min(
									24,
									Math.max(1, Number(e.target.value)),
								);
								onChange(id, { targetMonths: capped });
							}}
						/>
						<InputGroupAddon align="inline-end">
							<InputGroupText>mo</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
				</Field>
				<Field>
					<Label htmlFor={`emergency-apy-${id}`}>APY</Label>
					<InputGroup>
						<InputGroupInput
							id={`emergency-apy-${id}`}
							name="apy"
							type="number"
							min={0}
							max={100}
							step={0.01}
							value={data.apy}
							onFocus={selectOnFocus}
							onChange={(e) => {
								const capped = Math.min(
									100,
									Math.max(0, Number(e.target.value)),
								);
								onChange(id, { apy: capped });
							}}
						/>
						<InputGroupAddon align="inline-end">
							<InputGroupText>%</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
				</Field>
			</FieldGroup>
		</div>
	);
}
