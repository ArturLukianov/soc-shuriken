// lib/cache.ts
// Lookup results cached in localStorage, one entry per provider + value
// (e.g. "threatbook" + "1.2.3.4"), so re-running a recipe or adding steps
// after an API operation doesn't query the API again.

const PREFIX = "soc-cache:";

export const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

type Entry = { value: string; expires: number };

const entryKey = (provider: string, key: string) =>
  `${PREFIX}${provider}:${key}`;

export const LookupCache = {
  get(provider: string, key: string): string | undefined {
    try {
      const raw = localStorage.getItem(entryKey(provider, key));
      if (raw === null) return undefined;
      const entry: Entry = JSON.parse(raw);
      if (entry.expires <= Date.now()) {
        localStorage.removeItem(entryKey(provider, key));
        return undefined;
      }
      return entry.value;
    } catch {
      return undefined;
    }
  },

  set(provider: string, key: string, value: string, ttlMs = DEFAULT_TTL_MS) {
    const raw = JSON.stringify({ value, expires: Date.now() + ttlMs });
    try {
      localStorage.setItem(entryKey(provider, key), raw);
    } catch {
      // Most likely out of quota: drop expired entries and try once more
      LookupCache.pruneExpired();
      try {
        localStorage.setItem(entryKey(provider, key), raw);
      } catch {
        // Caching is best-effort
      }
    }
  },

  pruneExpired() {
    const now = Date.now();
    for (const key of cacheKeys()) {
      try {
        const entry: Entry = JSON.parse(localStorage.getItem(key) ?? "");
        if (entry.expires <= now) localStorage.removeItem(key);
      } catch {
        localStorage.removeItem(key);
      }
    }
  },

  count(): number {
    return cacheKeys().length;
  },

  clear() {
    for (const key of cacheKeys()) localStorage.removeItem(key);
  },
};

function cacheKeys(): string[] {
  try {
    return Object.keys(localStorage).filter((key) => key.startsWith(PREFIX));
  } catch {
    return [];
  }
}
