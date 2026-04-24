import type { CryptoCoinId } from "./types";

type Entry = { price: number; ts: number };

const STALE_MS = 60_000;
const cache = new Map<CryptoCoinId, Entry>();
const inflight = new Map<CryptoCoinId, Promise<number>>();

export async function fetchCoinPrice(id: CryptoCoinId): Promise<number> {
	const cached = cache.get(id);
	if (cached && Date.now() - cached.ts < STALE_MS) return cached.price;

	const existing = inflight.get(id);
	if (existing) return existing;

	const p = (async () => {
		try {
			const res = await fetch(
				`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd`,
			);
			if (!res.ok) throw new Error(`coingecko ${res.status}`);
			const json = (await res.json()) as Record<string, { usd?: number }>;
			const price = json[id]?.usd ?? 0;
			cache.set(id, { price, ts: Date.now() });
			return price;
		} finally {
			inflight.delete(id);
		}
	})();
	inflight.set(id, p);
	return p;
}
