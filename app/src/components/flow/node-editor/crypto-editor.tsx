import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	CRYPTO_COINS,
	CRYPTO_GROWTH_PROFILES,
	type CryptoCoinId,
	type CryptoGrowthProfile,
	type CryptoNodeData,
} from "../types";

export function CryptoEditor({
	node,
	onChange,
}: {
	node: CryptoNodeData;
	onChange: (id: string, data: Partial<CryptoNodeData["data"]>) => void;
}) {
	const { id, data } = node;

	return (
		<div className="px-4 py-3">
			<h3 className="mb-3 text-sm font-semibold">Edit Crypto</h3>
			<FieldGroup>
				<Field>
					<Label htmlFor={`crypto-name-${id}`}>Name</Label>
					<Input
						id={`crypto-name-${id}`}
						name="name"
						value={data.name}
						onChange={(e) => onChange(id, { name: e.target.value })}
					/>
				</Field>
				<Field>
					<Label>Coin</Label>
					<CoinCombobox
						value={data.coin}
						onChange={(coin) => onChange(id, { coin })}
					/>
				</Field>
				<Field>
					<Label htmlFor={`crypto-principal-${id}`}>Holdings (coins)</Label>
					<InputGroup>
						<InputGroupInput
							id={`crypto-principal-${id}`}
							name="principal"
							type="number"
							min={0}
							step="any"
							value={data.principal}
							onChange={(e) =>
								onChange(id, { principal: Math.max(0, Number(e.target.value)) })
							}
						/>
					</InputGroup>
				</Field>
				<Field>
					<Label htmlFor={`crypto-profile-${id}`}>Growth estimate</Label>
					<Select
						value={data.growthProfile}
						onValueChange={(v) =>
							onChange(id, { growthProfile: v as CryptoGrowthProfile })
						}
					>
						<SelectTrigger id={`crypto-profile-${id}`}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{CRYPTO_GROWTH_PROFILES.map((p) => (
									<SelectItem key={p.id} value={p.id}>
										{p.label} ({p.apy}% APY)
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

function CoinCombobox({
	value,
	onChange,
}: {
	value: CryptoCoinId;
	onChange: (v: CryptoCoinId) => void;
}) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const selected = CRYPTO_COINS.find((c) => c.id === value);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return CRYPTO_COINS;
		return CRYPTO_COINS.filter(
			(c) =>
				c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
		);
	}, [query]);

	return (
		<Popover
			open={open}
			onOpenChange={(o) => {
				setOpen(o);
				if (!o) setQuery("");
			}}
		>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between font-normal"
				>
					{selected ? `${selected.symbol} · ${selected.name}` : "Select coin"}
					<HugeiconsIcon
						icon={ArrowDown01Icon}
						strokeWidth={2}
						className="size-4 opacity-50"
					/>
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-[--radix-popover-trigger-width] p-0"
				align="start"
			>
				<div className="p-2 border-b">
					<Input
						autoFocus
						placeholder="Search coins…"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
				</div>
				<ul className="max-h-60 overflow-auto p-1">
					{filtered.length === 0 ? (
						<li className="px-2 py-1.5 text-sm text-muted-foreground">
							No matches
						</li>
					) : (
						filtered.map((c) => (
							<li key={c.id}>
								<button
									type="button"
									className={`w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent ${
										c.id === value ? "bg-accent" : ""
									}`}
									onClick={() => {
										onChange(c.id);
										setOpen(false);
										setQuery("");
									}}
								>
									<span className="font-medium">{c.symbol}</span>
									<span className="ml-2 text-muted-foreground">{c.name}</span>
								</button>
							</li>
						))
					)}
				</ul>
			</PopoverContent>
		</Popover>
	);
}
