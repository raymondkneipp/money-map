import type { Edge } from "@xyflow/react";
import { Field, FieldGroup } from "@/components/ui/field";
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
import {
	type AllocationEdgeData,
	type AllocationMode,
	FREQUENCIES,
	type Frequency,
} from "../types";

export function EdgeEditor({
	edge,
	onChange,
}: {
	edge: Edge;
	onChange: (id: string, data: AllocationEdgeData) => void;
}) {
	const { id } = edge;
	const data = (edge.data as AllocationEdgeData | undefined) ?? {
		mode: "remainder" as AllocationMode,
	};

	const update = (patch: Partial<AllocationEdgeData>) => {
		onChange(id, { ...data, ...patch });
	};

	const setMode = (mode: AllocationMode) => {
		// seed defaults for new mode so the edge has valid values immediately
		if (mode === "percent") {
			onChange(id, { mode, percent: data.percent ?? 100 });
		} else if (mode === "fixed") {
			onChange(id, {
				mode,
				amount: data.amount ?? 0,
				frequency: data.frequency ?? "monthly",
			});
		} else {
			onChange(id, { mode: "remainder" });
		}
	};

	return (
		<div className="px-4 py-3">
			<h3 className="mb-3 text-sm font-semibold">Edit Allocation</h3>
			<FieldGroup>
				<Field>
					<Label htmlFor={`edge-mode-${id}`}>Mode</Label>
					<Select
						value={data.mode}
						onValueChange={(v) => setMode(v as AllocationMode)}
					>
						<SelectTrigger id={`edge-mode-${id}`}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="percent">Percent of income</SelectItem>
								<SelectItem value="fixed">Fixed amount</SelectItem>
								<SelectItem value="remainder">Remainder (rest)</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</Field>

				{data.mode === "percent" && (
					<Field>
						<Label htmlFor={`edge-percent-${id}`}>Percent</Label>
						<InputGroup>
							<InputGroupInput
								id={`edge-percent-${id}`}
								type="number"
								min={0}
								max={100}
								value={data.percent ?? 0}
								onChange={(e) => {
									const capped = Math.min(
										100,
										Math.max(0, Number(e.target.value)),
									);
									update({ percent: capped });
								}}
							/>
							<InputGroupAddon align="inline-end">
								<InputGroupText>%</InputGroupText>
							</InputGroupAddon>
						</InputGroup>
					</Field>
				)}

				{data.mode === "fixed" && (
					<>
						<Field>
							<Label htmlFor={`edge-amount-${id}`}>Amount</Label>
							<InputGroup>
								<InputGroupAddon>
									<InputGroupText>$</InputGroupText>
								</InputGroupAddon>
								<InputGroupInput
									id={`edge-amount-${id}`}
									type="number"
									min={0}
									max={100_000}
									value={data.amount ?? 0}
									onChange={(e) => {
										const capped = Math.min(
											100_000,
											Math.max(0, Number(e.target.value)),
										);
										update({ amount: capped });
									}}
								/>
								<InputGroupAddon align="inline-end">
									<InputGroupText>USD</InputGroupText>
								</InputGroupAddon>
							</InputGroup>
						</Field>
						<Field>
							<Label htmlFor={`edge-frequency-${id}`}>Frequency</Label>
							<Select
								value={data.frequency ?? "monthly"}
								onValueChange={(v) => update({ frequency: v as Frequency })}
							>
								<SelectTrigger id={`edge-frequency-${id}`}>
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
					</>
				)}

				{data.mode === "remainder" && (
					<p className="text-xs text-muted-foreground">
						Receives whatever the source income has left after other outgoing
						allocations.
					</p>
				)}
			</FieldGroup>
		</div>
	);
}
