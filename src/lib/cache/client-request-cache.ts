type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const responseCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

const isEntryFresh = (entry: CacheEntry<unknown>) =>
  entry.expiresAt > Date.now();

export const getCachedValue = <T>(key: string): T | null => {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (!isEntryFresh(entry)) {
    responseCache.delete(key);
    return null;
  }
  return entry.value as T;
};

export const setCachedValue = <T>(key: string, value: T, ttlMs: number) => {
  if (ttlMs <= 0) return;
  responseCache.set(key, { value, expiresAt: Date.now() + ttlMs });
};

type FetchWithCacheOptions = {
  ttlMs?: number;
  force?: boolean;
};

export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: FetchWithCacheOptions = {},
): Promise<T> {
  const { ttlMs = 10000, force = false } = options;

  if (!force) {
    const cached = getCachedValue<T>(key);
    if (cached !== null) return cached;

    const inflight = inFlightRequests.get(key) as Promise<T> | undefined;
    if (inflight) return inflight;
  }

  const promise = (async () => {
    const data = await fetcher();
    setCachedValue(key, data, ttlMs);
    return data;
  })();

  inFlightRequests.set(key, promise);

  try {
    return await promise;
  } finally {
    inFlightRequests.delete(key);
  }
}

export const clearCachedValue = (key?: string) => {
  if (key) {
    responseCache.delete(key);
    return;
  }
  responseCache.clear();
};
