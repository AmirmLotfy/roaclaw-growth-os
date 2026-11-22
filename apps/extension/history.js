import { cleanText, ORIGINS, publicPageUrl } from './protocol.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RESULTS = 12;
const NON_PUBLIC_HOST = /(?:^\[|^\d{1,3}(?:\.\d{1,3}){3}$|\.(?:localhost|local|internal|lan|home)$)/i;

function historyMetadata(items, startTime, endTime) {
  const entries = new Map();
  for (const item of items.slice(0, MAX_RESULTS)) {
    const lastVisitedAt = item?.lastVisitTime;
    if (!Number.isFinite(lastVisitedAt) || lastVisitedAt < startTime || lastVisitedAt > endTime) continue;
    const url = publicPageUrl(item.url);
    if (!url) continue;
    const { hostname, origin, pathname } = new URL(url);
    const publicHost = hostname.includes('.') && !NON_PUBLIC_HOST.test(hostname);
    if (!publicHost && !(ORIGINS.has(origin) && pathname === '/demo-store/')) continue;
    if ((entries.get(url)?.lastVisitedAt ?? -1) >= lastVisitedAt) continue;
    entries.set(url, { url, title: cleanText(item.title, 160) || hostname, lastVisitedAt });
  }
  return [...entries.values()].sort((first, second) => second.lastVisitedAt - first.lastVisitedAt);
}

// Call directly from the side panel's submitted form so Chrome receives a user gesture.
export async function searchRecentHistory(browser, query, { signal, now = Date.now() } = {}) {
  const text = typeof query === 'string' ? query.trim() : '';
  if (text.length < 2 || text.length > 80) return { status: 'invalid' };
  if (signal?.aborted) return { status: 'canceled' };

  try {
    const granted = await browser.permissions.request({ permissions: ['history'] });
    if (signal?.aborted) return { status: 'canceled' };
    if (!granted) return { status: 'denied' };
    const startTime = now - DAY_MS;
    const items = await browser.history.search({ text, startTime, endTime: now, maxResults: MAX_RESULTS });
    if (signal?.aborted) return { status: 'canceled' };
    return { status: 'ready', entries: historyMetadata(items, startTime, now) };
  } catch {
    return { status: signal?.aborted ? 'canceled' : 'error' };
  }
}
