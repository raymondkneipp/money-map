import { BitcoinCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Position, useEdges, useNodes } from "@xyflow/react";
import { useEffect, useMemo, useState } from "react";
import { edgeAnnualValue } from "#/lib/allocation";
import { usd } from "#/lib/format";
import {
	BaseNode,
	BaseNodeContent,
	BaseNodeHeader,
	BaseNodeHeaderTitle,
} from "@/components/base-node";
import { BaseHandle } from "../../base-handle";
import { fetchCoinPrice } from "../crypto-price";
import {
	CRYPTO_COINS,
	CRYPTO_GROWTH_PROFILES,
	type CryptoNodeData,
} from "../types";

export function CryptoNode({
	id,
	data,
}: {
	id: string;
	data: CryptoNodeData["data"];
}) {
	const nodes = useNodes();
	const edges = useEdges();

	const coin = CRYPTO_COINS.find((c) => c.id === data.coin);
	const profile = CRYPTO_GROWTH_PROFILES.find(
		(p) => p.id === data.growthProfile,
	);

	const [price, setPrice] = useState<number | null>(null);
	const [error, setError] = useState(false);

	useEffect(() => {
		let alive = true;
		setError(false);
		fetchCoinPrice(data.coin)
			.then((p) => {
				if (alive) setPrice(p);
			})
			.catch(() => {
				if (alive) setError(true);
			});
		return () => {
			alive = false;
		};
	}, [data.coin]);

	const monthlyContribution = useMemo(() => {
		const annual = edges
			.filter(
				(e) =>
					e.target === id && (e.type === "allocation" || e.type === "expense"),
			)
			.reduce((acc, e) => acc + edgeAnnualValue(e, nodes, edges), 0);
		return annual / 12;
	}, [id, nodes, edges]);

	const currentValueUsd = price != null ? data.principal * price : null;

	return (
		<BaseNode className="w-48 bg-assets border-assets-border in-[.selected]:shadow-assets-border/50">
			<BaseNodeHeader className="border-b border-assets-border">
				<HugeiconsIcon
					icon={BitcoinCircleIcon}
					strokeWidth={2}
					className="size-4"
				/>
				<BaseNodeHeaderTitle className="font-normal">
					{data.name}
				</BaseNodeHeaderTitle>
			</BaseNodeHeader>
			<BaseNodeContent>
				<div className="flex items-baseline justify-between gap-2">
					<span className="text-xs text-foreground">Holdings</span>
					<span className="font-heading font-semibold tabular-nums">
						{data.principal}
						<span className="ml-0.5 text-xs font-normal">
							{coin?.symbol ?? ""}
						</span>
					</span>
				</div>
				<div className="flex items-baseline justify-between gap-2">
					<span className="text-xs text-foreground">Value</span>
					<span className="font-heading font-semibold tabular-nums">
						{error
							? "—"
							: currentValueUsd == null
								? "…"
								: usd.format(currentValueUsd)}
					</span>
				</div>
				<div className="flex items-baseline justify-between gap-2">
					<span className="text-xs text-foreground">Contribution</span>
					<span className="text-sm tabular-nums">
						{usd.format(monthlyContribution)}
						<span className="ml-0.5 text-xs font-normal">/mo</span>
					</span>
				</div>
				<div className="flex items-baseline justify-between gap-2">
					<span className="text-xs text-foreground">Growth</span>
					<span className="text-xs tabular-nums">
						{profile ? `${profile.label} (${profile.apy}%)` : "—"}
					</span>
				</div>
				<BaseHandle id="target-1" type="target" position={Position.Left} />
			</BaseNodeContent>
		</BaseNode>
	);
}
