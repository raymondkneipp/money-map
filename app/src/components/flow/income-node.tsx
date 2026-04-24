import { useCallback, useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import {
	BaseNode,
	BaseNodeContent,
	BaseNodeHeader,
	BaseNodeHeaderTitle,
} from "@/components/base-node";
import { Button } from "@/components/ui/button";
import { Edit03Icon, Money01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
	InputGroupTextarea,
} from "@/components/ui/input-group";
import { BaseHandle } from "../base-handle";

export function IncomeNode({
	id,
	data,
}: {
	id: string;
	data: { label: string; value: number };
}) {
	const { updateNodeData } = useReactFlow();

	const [label, setLabel] = useState(data.label);
	const [number, setNumber] = useState(data.value);

	const onChange = useCallback((evt) => {
		const cappedNumber = Math.min(255, Math.max(0, evt.target.value));
		setNumber(cappedNumber);
		updateNodeData(id, { value: cappedNumber });
	}, []);

	const onChangeLabel = useCallback((evt) => {
		setLabel(evt.target.value);
		updateNodeData(id, { label: evt.target.value });
	}, []);

	return (
		<BaseNode className="w-48 dark:bg-green-900 dark:border-green-600 bg-green-200 border-green-400">
			<BaseNodeHeader className="border-b dark:border-green-600 border-green-400">
				<HugeiconsIcon icon={Money01Icon} strokeWidth={2} className="size-4" />
				<BaseNodeHeaderTitle>{label}</BaseNodeHeaderTitle>

				<Dialog>
					<form>
						<DialogTrigger asChild>
							<Button variant="ghost" size="icon" className="nodrag">
								<HugeiconsIcon icon={Edit03Icon} strokeWidth={2} />
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-sm">
							<DialogHeader>
								<DialogTitle>Edit Income</DialogTitle>
								<DialogDescription>
									Make changes to your income.
								</DialogDescription>
							</DialogHeader>
							<FieldGroup>
								<Field>
									<Label htmlFor={`label-${id}`}>Label</Label>
									<Input id={`label-${id}`} name="label" defaultValue={label} />
								</Field>
								<Field>
									<Label htmlFor={`value-${id}`}>Value</Label>

									<InputGroup>
										<InputGroupAddon>
											<InputGroupText>$</InputGroupText>
										</InputGroupAddon>
										<InputGroupInput
											placeholder="0.00"
											id={`value-${id}`}
											name="value"
											defaultValue={number}
											type="number"
											min={0}
											max={100_000}
											onChange={onChange}
										/>
										<InputGroupAddon align="inline-end">
											<InputGroupText>USD</InputGroupText>
										</InputGroupAddon>
									</InputGroup>
								</Field>
							</FieldGroup>
							<DialogFooter>
								<DialogClose asChild>
									<Button variant="outline">Cancel</Button>
								</DialogClose>
								<Button type="submit">Save changes</Button>
							</DialogFooter>
						</DialogContent>
					</form>
				</Dialog>
			</BaseNodeHeader>
			<BaseNodeContent>
				<p className="font-heading">${number}</p>

				<BaseHandle id="source-1" type="source" position={Position.Right} />
			</BaseNodeContent>
		</BaseNode>
	);
}
