import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import type { SavingsNodeData } from "../types";
import { selectOnFocus } from "./select-on-focus";

export function SavingsEditor({
	node,
	onChange,
}: {
	node: SavingsNodeData;
	onChange: (id: string, data: Partial<SavingsNodeData["data"]>) => void;
}) {
	const { id, data } = node;

	return (
		<div className="px-4 py-3">
			<h3 className="mb-3 text-sm font-semibold">Edit Savings</h3>
			<FieldGroup>
				<Field>
					<Label htmlFor={`savings-name-${id}`}>Name</Label>
					<Input
						id={`savings-name-${id}`}
						name="name"
						value={data.name}
						onChange={(e) => onChange(id, { name: e.target.value })}
					/>
				</Field>
				<Field>
					<Label htmlFor={`savings-principal-${id}`}>Current balance</Label>
					<InputGroup>
						<InputGroupAddon>
							<InputGroupText>$</InputGroupText>
						</InputGroupAddon>
						<InputGroupInput
							id={`savings-principal-${id}`}
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
					<Label htmlFor={`savings-apy-${id}`}>APY</Label>
					<InputGroup>
						<InputGroupInput
							id={`savings-apy-${id}`}
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
