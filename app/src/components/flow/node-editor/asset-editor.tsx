import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import type {
	BrokerageNodeData,
	IRANodeData,
	OtherAssetNodeData,
} from "../types";
import { selectOnFocus } from "./select-on-focus";

type AssetNode = IRANodeData | BrokerageNodeData | OtherAssetNodeData;

export function AssetEditor({
	node,
	onChange,
	title,
}: {
	node: AssetNode;
	onChange: (id: string, data: Partial<AssetNode["data"]>) => void;
	title: string;
}) {
	const { id, data } = node;

	return (
		<div className="px-4 py-3">
			<h3 className="mb-3 text-sm font-semibold">{title}</h3>
			<FieldGroup>
				<Field>
					<Label htmlFor={`asset-name-${id}`}>Name</Label>
					<Input
						id={`asset-name-${id}`}
						value={data.name}
						onChange={(e) => onChange(id, { name: e.target.value })}
					/>
				</Field>
				<Field>
					<Label htmlFor={`asset-principal-${id}`}>Current balance</Label>
					<InputGroup>
						<InputGroupAddon>
							<InputGroupText>$</InputGroupText>
						</InputGroupAddon>
						<InputGroupInput
							id={`asset-principal-${id}`}
							type="number"
							min={0}
							max={10_000_000}
							step={0.01}
							value={data.principal}
							onFocus={selectOnFocus}
							onChange={(e) =>
								onChange(id, {
									principal: Math.max(0, Number(e.target.value)),
								})
							}
						/>
						<InputGroupAddon align="inline-end">
							<InputGroupText>USD</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
				</Field>
				<Field>
					<Label htmlFor={`asset-apy-${id}`}>Annual return</Label>
					<InputGroup>
						<InputGroupInput
							id={`asset-apy-${id}`}
							type="number"
							min={0}
							max={100}
							step={0.1}
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
			</FieldGroup>
		</div>
	);
}
