export const PRIMARY_ORIGIN = 'https://roaclaw-growth-os-2026.web.app';
export const ORIGINS = new Set([
  PRIMARY_ORIGIN,
  'https://roaclaw-growth-os-2026.firebaseapp.com',
  'https://roaclaw.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);
export const PREFLIGHT = 'campaign-preflight';
export const GROWTH_AUDIT = 'growth-audit';

export const ERRORS = {
  BAD_INPUT: 'The workspace sent an invalid request.',
  FORBIDDEN_ORIGIN: 'This page cannot connect to the ROACLAW companion.',
  NOT_PAIRED: 'Request pairing in your workspace, then confirm it in this panel.',
  PAIR_BUSY: 'Review the current pairing request in the panel first.',
  PAIR_STALE: 'The pairing request changed or expired. Request it again from the workspace.',
  PREFLIGHT_TAB_UNAVAILABLE: 'Return to the original Campaign Preflight tab to retrieve this capture.',
  TAB_UNAVAILABLE: 'Open a public landing page and click the ROACLAW toolbar icon on that tab.',
  TAB_CHANGED: 'The current tab changed. Review the active page before capturing again.',
  PRIVATE_PAGE: 'This page appears to contain private or account information. Open a public landing page.',
  CAPTURE_FAILED: 'Chrome could not read this page. Click the ROACLAW toolbar icon on the target tab and try again.',
  ACTION_BUSY: 'Finish or dismiss the pending bookmark in the panel first.',
  ACTION_LIMIT: 'This pairing reached its bookmark request limit. Pair again to continue.',
  ACTION_CONFLICT: 'This bookmark request ID already belongs to a different target.',
  ACTION_STALE: 'This bookmark request has changed or expired.',
  PERMISSION_REQUIRED: 'Allow Chrome bookmark access to save this bookmark.',
  INTERNAL: 'The companion could not complete this request. Try again.',
};

export const ID = /^[A-Za-z0-9_-]{1,128}$/;
const SESSION_ID = /^[A-Za-z0-9_-]{16,128}$/;
const HOSTNAME = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.?$|^\[[a-f0-9:.]+\]$/i;
const FORBIDDEN_DISPLAY = /[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/u;
const CONTACT = /[\w.!#$%&'*+/=?^_`{|}~-]+@[\w.-]+\.[a-z]{2,}|(?:\+\d{1,3}[\s.-]*)?\(?\d{3}\)?[\s.-]+\d{3}[\s.-]+\d{4}|\b(?:\d[ -]?){13,19}\b/i;
const SECRET = /\b(?:api[-_ ]?key|bearer|password|passcode|access[-_ ]?token|refresh[-_ ]?token)\s*[:= ]\s*[a-z0-9._/-]{6,}|\b(?:eyJ[a-z0-9_-]{12,}|[a-z0-9_-]{42,})\b/i;
const PRIVATE_PATH = /(?:^|\/)(?:account[s]?|admin|auth|billing|cart|checkout|dashboard|inbox|login|log-in|logout|my-account|order[s]?|payment[s]?|private|profile|reset-password|settings|sign-in|signin|sign-up|signup|subscriber[s]?|token[s]?|user[s]?)(?:\/|$)/i;
const PRIVATE_HOST = /^(?:accounts?|admin|auth|billing|business|dashboard|mail|outlook|payments|secure|webmail)\./i;
const DEMO_QUERY = new Map([
  ['utm_source', 'meta'],
  ['utm_medium', 'paid_social'],
  ['utm_campaign', 'weekend-everyday-essentials'],
]);

export function responseError(code) {
  return { ok: false, code, message: ERRORS[code] };
}

export function cleanText(value, max) {
  if (typeof value !== 'string' || value.length > 1200 || FORBIDDEN_DISPLAY.test(value.replace(/[\t\r\n]/g, ' '))) return '';
  const text = value.replace(/\s+/g, ' ').trim();
  if (!text || CONTACT.test(text) || SECRET.test(text)) return '';
  return text.slice(0, max).trim();
}

export function publicPageUrl(value) {
  if (typeof value !== 'string' || value.length > 2048 || FORBIDDEN_DISPLAY.test(value)) return null;
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    if (PRIVATE_HOST.test(url.hostname) || url.hostname === 'ads.google.com' || url.hostname === 'adsmanager.facebook.com') return null;
    const path = decodeURIComponent(url.pathname);
    if (ORIGINS.has(url.origin) && /^\/app(?:\/|$)/.test(path)) return null;
    if (PRIVATE_PATH.test(path) || path.length > 420 || !cleanText(path, 420) || CONTACT.test(path)) return null;
    // Strip search parameters and fragments before the page address leaves the extension.
    return `${url.origin}${url.pathname}`;
  } catch {
    return null;
  }
}

function bookmarkUrl(value, origin) {
  const publicUrl = publicPageUrl(value);
  if (!publicUrl) return null;
  const url = new URL(value);
  if (url.hash || value.includes('#')) return null;
  if (!value.includes('?')) return publicUrl;
  const pairs = [...url.searchParams];
  if (url.origin !== origin || url.pathname !== '/demo-store/' || pairs.length !== DEMO_QUERY.size) return null;
  const matches = [...DEMO_QUERY].every(([key, expected]) => url.searchParams.getAll(key).length === 1 && url.searchParams.get(key) === expected);
  return matches ? url.href : null;
}

export function appPurpose(pathname) {
  if (pathname === '/app/preflight' || pathname === '/app/preflight/') return PREFLIGHT;
  if (pathname === '/app' || pathname === '/app/') return GROWTH_AUDIT;
  return null;
}

export function senderScope(sender) {
  if (!sender || sender.frameId !== 0 || sender.tab?.incognito || !Number.isSafeInteger(sender.tab?.id)) return null;
  try {
    const url = new URL(sender.url);
    const purpose = appPurpose(url.pathname);
    if (url.username || url.password || !purpose || sender.origin !== url.origin || !ORIGINS.has(url.origin)) return null;
    return { origin: url.origin, tabId: sender.tab.id, purpose };
  } catch {
    return null;
  }
}

function destinationHostname(value) {
  if (typeof value !== 'string' || value.length > 253 || !HOSTNAME.test(value)) return null;
  try {
    return new URL(`https://${value}`).hostname;
  } catch {
    return null;
  }
}

export function parseExternal(message, origin, purpose = GROWTH_AUDIT) {
  if (!message || typeof message !== 'object' || typeof message.workspaceId !== 'string' || !ID.test(message.workspaceId) ||
      typeof message.sessionId !== 'string' || !SESSION_ID.test(message.sessionId)) return null;
  if ((purpose === PREFLIGHT) !== (message.workspaceId === PREFLIGHT)) return null;
  const scope = { workspaceId: message.workspaceId, sessionId: message.sessionId };
  switch (message.type) {
    case 'ROACLAW_PAIR': {
      const workspaceName = cleanText(message.workspaceName, 100);
      if (!workspaceName) return null;
      const pair = { ...scope, type: message.type, workspaceName };
      if (purpose !== PREFLIGHT || message.destinationHost === undefined) return pair;
      const destinationHost = destinationHostname(message.destinationHost);
      return destinationHost ? { ...pair, destinationHost } : null;
    }
    case 'ROACLAW_DISCONNECT':
    case 'ROACLAW_CAPTURE':
      return { ...scope, type: message.type };
    case 'ROACLAW_PROPOSE_BOOKMARK': {
      if (purpose === PREFLIGHT) return null;
      const { id, title: rawTitle, url: rawUrl } = message.proposal ?? {};
      const title = cleanText(rawTitle, 160);
      const url = bookmarkUrl(rawUrl, origin);
      return typeof id === 'string' && ID.test(id) && title && url ? { ...scope, type: message.type, proposal: { id, title, url } } : null;
    }
    case 'ROACLAW_RECEIPT':
      if (purpose === PREFLIGHT) return null;
      return typeof message.proposalId === 'string' && ID.test(message.proposalId) ? { ...scope, type: message.type, proposalId: message.proposalId } : null;
    default:
      return null;
  }
}

export function matchesScope(binding, request) {
  return binding && binding.origin === request.origin && binding.tabId === request.tabId &&
    binding.workspaceId === request.workspaceId && binding.sessionId === request.sessionId &&
    (binding.purpose ?? GROWTH_AUDIT) === request.purpose;
}
