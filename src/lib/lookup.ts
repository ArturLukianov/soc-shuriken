// lib/lookup.ts
import { DEFAULT_TTL_MS, LookupCache } from "./cache";
import { OperationResult } from "./types";

export type LookupOutcome = {
  result: string;
  // false for errors (rate limits, bad responses) so they're retried next run
  cache: boolean;
};

// Runs `lookup` for every non-empty input line and returns one output line
// per input line. Successful results are cached per value; duplicates are
// only looked up once.
export async function lookupEach(
  input: string,
  {
    provider,
    lookup,
    ttlMs = DEFAULT_TTL_MS,
    concurrency = 1,
    delayMs = 0,
  }: {
    provider: string;
    lookup: (value: string) => Promise<LookupOutcome>;
    ttlMs?: number;
    concurrency?: number;
    // Pause after each request that actually hits the API
    delayMs?: number;
  },
): Promise<OperationResult> {
  const values = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const results = new Map<string, string>();
  const pending: string[] = [];
  for (const value of new Set(values)) {
    const cached = LookupCache.get(provider, value);
    if (cached !== undefined) results.set(value, cached);
    else pending.push(value);
  }
  const cachedCount = results.size;

  let next = 0;
  const worker = async () => {
    while (next < pending.length) {
      const value = pending[next++];
      let outcome: LookupOutcome;
      try {
        outcome = await lookup(value);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        outcome = { result: `❌ (Error: ${message}) ${value}`, cache: false };
      }
      results.set(value, outcome.result);
      if (outcome.cache)
        LookupCache.set(provider, value, outcome.result, ttlMs);
      if (delayMs > 0 && next < pending.length) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(concurrency, pending.length) }, worker),
  );

  const info =
    cachedCount > 0
      ? `${cachedCount} cached · ${pending.length} fetched`
      : `${pending.length} fetched`;

  return {
    result: values.map((value) => results.get(value)).join("\n"),
    info,
  };
}
