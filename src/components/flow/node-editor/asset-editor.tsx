import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo } from "react";
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
import { ASSET_TYPE_ICON } from "../nodes/asset-node";
import { ASSET_TYPES, type AssetNodeData, type AssetType } from "../types";
import { selectOnFocus } from "./select-on-focus";

export function AssetEditor({
	node,
	onChange,
}: {
	node: AssetNodeData;
	onChange: (id: string, data: Partial<AssetNodeData["data"]>) => void;
}) {
	const { id, data } = node;

	const title = useMemo(
		() =>
			ASSET_TYPES.find((t) => t.id === data.assetType)?.editTitle ??
			"Edit Asset",
		[data.assetType],
	);

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
					<Label htmlFor={`asset-type-${id}`}>Type</Label>
					<Select
						value={data.assetType}
						onValueChange={(v) => onChange(id, { assetType: v as AssetType })}
					>
						<SelectTrigger id={`asset-type-${id}`}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{ASSET_TYPES.map((t) => (
									<SelectItem key={t.id} value={t.id}>
										<HugeiconsIcon
											icon={ASSET_TYPE_ICON[t.id]}
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
