import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import type { RetirementNodeData } from "../types";
import { selectOnFocus } from "./select-on-focus";

export function RetirementEditor({
	node,
	onChange,
}: {
	node: RetirementNodeData;
	onChange: (id: string, data: Partial<RetirementNodeData["data"]>) => void;
}) {
	const { id, data } = node;

	return (
		<div className="px-4 py-3">
			<h3 className="mb-3 text-sm font-semibold">Edit 401(k)</h3>
			<FieldGroup>
				<Field>
					<Label htmlFor={`retirement-name-${id}`}>Name</Label>
					<Input
						id={`retirement-name-${id}`}
						value={data.name}
						onChange={(e) => onChange(id, { name: e.target.value })}
					/>
				</Field>
				<Field>
					<Label htmlFor={`retirement-principal-${id}`}>Current balance</Label>
					<InputGroup>
						<InputGroupAddon>
							<InputGroupText>$</InputGroupText>
						</InputGroupAddon>
						<InputGroupInput
							id={`retirement-principal-${id}`}
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
					<Label htmlFor={`retirement-apy-${id}`}>Annual return</Label>
					<InputGroup>
						<InputGroupInput
							id={`retirement-apy-${id}`}
							type="number"
							min={0}
							max={100}
							step="0.1"
							value={data.apy}
							onFocus={selectOnFocus}
							onChange={(e) =>
								onChange(id, {
									apy: Math.min(100, Math.max(0, Number(e.target.value))),
								})
							}
						/>
						<InputGroupAddon align="inline-end">
							<InputGroupText>%</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
				</Field>
				<Field>
					<Label htmlFor={`retirement-match-${id}`}>Employer match</Label>
					<InputGroup>
						<InputGroupInput
							id={`retirement-match-${id}`}
							type="number"
							min={0}
							max={200}
							step="1"
							value={data.employerMatch}
							onFocus={selectOnFocus}
							onChange={(e) =>
								onChange(id, {
									employerMatch: Math.min(
										200,
										Math.max(0, Number(e.target.value)),
									),
								})
							}
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
