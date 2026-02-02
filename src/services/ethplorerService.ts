/** Ethplorer API for token holder count. */

const ETHPLORER_API_BASE = 'https://api.ethplorer.io';

interface EthplorerTokenInfo {
  address?: string;
  totalSupply?: string;
  name?: string;
  symbol?: string;
  decimals?: string;
  holdersCount?: number;
  [key: string]: unknown;
}

interface EthplorerError {
  error: { code: number; message: string };
}

const CACHE_KEY_PREFIX = 'ethplorer_holders_';
const CACHE_DURATION = 60 * 60 * 1000;
const MIN_REQUEST_INTERVAL_MS = 500;
const MAX_RETRIES = 2;
const RETRY_BASE_MS = 1000;

let lastRequestTime = 0;
let requestQueue: Promise<void> = Promise.resolve();

const throttle = (): Promise<void> => {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  const waitMs = Math.max(0, MIN_REQUEST_INTERVAL_MS - elapsed);
  lastRequestTime = now + waitMs;

  const next = requestQueue.then(
    () => new Promise<void>((r) => setTimeout(r, waitMs))
  );
  requestQueue = next;
  return next;
};

const getFromCache = (contractAddress: string): number | null => {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${contractAddress.toLowerCase()}`);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) return null;
    return data;
  } catch {
    return null;
  }
};

const setCache = (contractAddress: string, count: number) => {
  try {
    localStorage.setItem(
      `${CACHE_KEY_PREFIX}${contractAddress.toLowerCase()}`,
      JSON.stringify({ data: count, timestamp: Date.now() })
    );
  } catch {
    // localStorage might be full
  }
};

const doFetch = async (
  url: string,
  retries = 0
): Promise<Response> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'User-Agent': 'SHI4GUD/1.0 (https://shi4gud.com)',
    },
  });

  const isRetryable =
    (response.status === 429 || response.status === 503) &&
    retries < MAX_RETRIES;

  if (isRetryable) {
    const retryAfter = response.headers.get('Retry-After');
    const retrySec = retryAfter ? parseInt(retryAfter, 10) : NaN;
    const backoffMs = !isNaN(retrySec)
      ? Math.min(retrySec * 1000, 30_000)
      : RETRY_BASE_MS * Math.pow(2, retries);
    await new Promise((r) => setTimeout(r, backoffMs));
    return doFetch(url, retries + 1);
  }

  return response;
};

export const fetchTokenHolderCount = async (
  contractAddress: string
): Promise<number | null> => {
  const apiKey =
    import.meta.env.VITE_ETHPLORER_API_KEY ||
    (import.meta.env.DEV ? 'freekey' : null);
  if (!apiKey || apiKey === 'YOUR_ETHPLORER_API_KEY') {
    return null;
  }

  const cacheKey = contractAddress.toLowerCase();
  const cached = getFromCache(cacheKey);
  if (cached !== null) return cached;

  try {
    await throttle();

    const url = `${ETHPLORER_API_BASE}/getTokenInfo/${contractAddress}?apiKey=${apiKey}`;
    const response = await doFetch(url);

    const data: EthplorerTokenInfo | EthplorerError = await response.json();

    if (!response.ok) return null;

    const holdersCount = (data as EthplorerTokenInfo).holdersCount;
    if (typeof holdersCount === 'number' && holdersCount > 0) {
      setCache(cacheKey, holdersCount);
      return holdersCount;
    }

    return null;
  } catch {
    return null;
  }
};
