import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';

const API_BASE_URL = 'https://cms.nahjalbalaghah.org/';
// const API_BASE_URL = 'http://localhost:1337/';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.code === 'ECONNABORTED' || error.message.includes('timeout')) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      console.warn('Request timeout, retrying...');

      originalRequest.timeout = 90000;

      try {
        return await api(originalRequest);
      } catch (retryError) {
        console.error('Retry failed:', retryError);
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Response cache for GET requests
//
// The CMS sends no cache headers, so without this every page view re-downloads
// the same content. Responses are kept in memory (survives client-side page
// navigation) and in sessionStorage (survives reloads in the same tab).
// Identical requests that are already in flight share one network call.
// ---------------------------------------------------------------------------

const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_MEMORY_ENTRIES = 400;
const STORAGE_PREFIX = 'nb-api:';
const MAX_STORAGE_ENTRY_CHARS = 1_000_000;

type CacheEntry = { at: number; status: number; data: unknown };

const memoryCache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<AxiosResponse>>();

const clone = <T,>(value: T): T =>
  typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));

const isFresh = (entry: CacheEntry | null | undefined): entry is CacheEntry =>
  !!entry && Date.now() - entry.at < CACHE_TTL_MS;

function readStorage(key: string): CacheEntry | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_PREFIX + key);
    return raw ? (JSON.parse(raw) as CacheEntry) : null;
  } catch {
    return null;
  }
}

function clearStorage() {
  try {
    const storage = window.sessionStorage;
    for (let i = storage.length - 1; i >= 0; i--) {
      const k = storage.key(i);
      if (k?.startsWith(STORAGE_PREFIX)) storage.removeItem(k);
    }
  } catch {
    // Storage unavailable (private mode, blocked site data): the memory cache still works
  }
}

function writeStorage(key: string, entry: CacheEntry) {
  try {
    const serialized = JSON.stringify(entry);
    if (serialized.length > MAX_STORAGE_ENTRY_CHARS) return;
    window.sessionStorage.setItem(STORAGE_PREFIX + key, serialized);
  } catch {
    // Most likely over quota: drop our older entries rather than fail
    clearStorage();
  }
}

function remember(key: string, entry: CacheEntry) {
  memoryCache.delete(key);
  memoryCache.set(key, entry);
  if (memoryCache.size > MAX_MEMORY_ENTRIES) {
    const oldest = memoryCache.keys().next().value;
    if (oldest !== undefined) memoryCache.delete(oldest);
  }
  writeStorage(key, entry);
}

const asResponse = (entry: CacheEntry, config: AxiosRequestConfig): AxiosResponse =>
  ({
    data: clone(entry.data),
    status: entry.status,
    statusText: 'OK',
    headers: {},
    config,
  }) as AxiosResponse;

const networkGet = api.get.bind(api);

api.get = (async (url: string, config: AxiosRequestConfig = {}) => {
  // Only cache in the browser; on the server a shared cache could leak between requests
  if (typeof window === 'undefined') return networkGet(url, config);

  const key = api.getUri({ ...config, url });

  let entry: CacheEntry | null | undefined = memoryCache.get(key);
  if (!isFresh(entry)) {
    entry = readStorage(key);
    if (isFresh(entry)) memoryCache.set(key, entry);
  }
  if (isFresh(entry)) return asResponse(entry, config);

  let pending = inflight.get(key);
  if (!pending) {
    pending = networkGet(url, config)
      .then((response) => {
        remember(key, { at: Date.now(), status: response.status, data: response.data });
        return response;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, pending);
  }

  // Hand every caller its own copy so mutations never leak into the cache
  const response = await pending;
  return { ...response, data: clone(response.data) };
}) as typeof api.get;

/** Drop all cached CMS responses (memory and sessionStorage). */
export function clearApiCache() {
  memoryCache.clear();
  if (typeof window !== 'undefined') clearStorage();
}

export default api;
