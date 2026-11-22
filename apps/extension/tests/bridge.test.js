import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { readLandingPage, safeCapture } from '../capture.js';
import { ORIGINS, parseExternal, PREFLIGHT, publicPageUrl } from '../protocol.js';

const origin = 'https://roaclaw-growth-os-2026.web.app';
const scope = { workspaceId: 'weekend-co', sessionId: '12345678-1234-1234-1234-123456789012' };
const fixture = `${origin}/demo-store/`;
const target = `${fixture}?utm_source=meta&utm_medium=paid_social&utm_campaign=weekend-everyday-essentials`;
const workspace = { url: `${origin}/app/`, origin, frameId: 0, tab: { id: 4, incognito: false } };
const preflightPage = { ...workspace, url: `${origin}/app/preflight/` };
const extensionId = 'loglkephefkogehklbohjpdnhdalgnmc';
const extensionUrl = `chrome-extension://${extensionId}/`;
const panel = { id: extensionId, url: `${extensionUrl}panel.html` };

const request = (type, extra) => ({ ...scope, type, ...extra });
const pair = request('ROACLAW_PAIR', { workspaceName: 'Weekend Co' });
const propose = request('ROACLAW_PROPOSE_BOOKMARK', { proposal: { id: 'proposal-1', title: 'Landing-page research', url: target } });
const receipt = request('ROACLAW_RECEIPT', { proposalId: propose.proposal.id });
const capture = request('ROACLAW_CAPTURE');
const preflightRequest = (type, extra) => request(type, { workspaceId: PREFLIGHT, ...extra });
const preflightPair = preflightRequest('ROACLAW_PAIR', { workspaceName: 'Weekend Collection', destinationHost: new URL(fixture).hostname });
const preflightCapture = preflightRequest('ROACLAW_CAPTURE');

test('manifest keeps the development ID and grants no blanket host access', async () => {
  const manifest = JSON.parse(await readFile(new URL('../manifest.json', import.meta.url), 'utf8'));
  const keyDigest = createHash('sha256').update(Buffer.from(manifest.key, 'base64')).digest('hex').slice(0, 32);
  const id = [...keyDigest].map((c) => String.fromCharCode(97 + parseInt(c, 16))).join('');
  assert.equal(id, extensionId);
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  assert.deepEqual(manifest.permissions, ['activeTab', 'scripting', 'sidePanel', 'storage']);
  assert.deepEqual(manifest.optional_permissions, ['bookmarks', 'history']);
  assert.deepEqual(manifest.externally_connectable.matches, [...ORIGINS].map((url) => `${url}/*`));
  assert.equal(manifest.host_permissions, undefined);
  assert.equal(manifest.incognito, 'not_allowed');
  for (const path of Object.values(manifest.icons)) assert.ok((await readFile(new URL(`../${path}`, import.meta.url))).length);
});

test('bookmark URL admits the exact same-origin fixture UTM and safe ordinary pages', () => {
  const normalize = (url, boundOrigin = origin) => parseExternal({ ...propose, proposal: { ...propose.proposal, url } }, boundOrigin)?.proposal.url;
  assert.equal(normalize(target), target);
  assert.equal(normalize('https://example.org/new'), 'https://example.org/new');
  for (const invalid of [
    'javascript:alert(1)', 'chrome://bookmarks/', 'https://name:pass@example.org/', 'https://example.org/account/orders',
    `${fixture}?debug=abc`, `${target}&token=xyz`, `${target}&utm_source=meta`, `${target}#fragment`,
    target.replace('utm_source=meta', 'utm_source=other'), target.replace('/demo-store/', '/pricing/'),
    target.replace(origin, 'http://localhost:3000'), 'https://example.org/someone%40example.org',
  ]) assert.equal(normalize(invalid), undefined, invalid);
  assert.equal(publicPageUrl(`${fixture}?session=private#home`), fixture);
  assert.equal(publicPageUrl('https://ads.google.com/campaigns/'), null);
});

test('preflight handshake only accepts a hostname and capture-scoped operations', () => {
  const parse = (message) => parseExternal(message, origin, PREFLIGHT);
  assert.equal(parseExternal(preflightPair, origin), null);
  assert.equal(parse(pair), null);
  assert.equal(parse({ ...preflightPair, destinationHost: 'Destination.Example' }).destinationHost, 'destination.example');
  assert.equal(parse({ ...preflightPair, destinationHost: '[::1]' }).destinationHost, '[::1]');
  assert.equal(parse({ ...preflightPair, destinationHost: undefined }).destinationHost, undefined);
  assert.equal(parse(preflightCapture).type, 'ROACLAW_CAPTURE');
  assert.equal(parse(preflightRequest('ROACLAW_DISCONNECT')).type, 'ROACLAW_DISCONNECT');
  assert.equal(parse({ ...propose, workspaceId: PREFLIGHT }), null);
  assert.equal(parse({ ...receipt, workspaceId: PREFLIGHT }), null);
  for (const destinationHost of ['https://example.com', 'example.com/offer', 'example.com:3000', 'example.com?secret=x', 'example.com#page', 'user@example.com', 'example.com\n', 'a..example.com']) {
    assert.equal(parse({ ...preflightPair, destinationHost }), null, destinationHost);
  }
});

test('capture trimming drops common identifiers and retains bounded exact evidence', () => {
  const evidence = safeCapture({ title: 'Welcome alice@example.org', headings: Array.from({ length: 15 }, (_, i) => `Heading ${i}`),
    visiblePriceText: ['$119', 'USD 119', '$119', 'Phone: 555-555-5555'], ctas: ['Buy now', 'password: abcdefghi'] }, fixture,
  new Date('2026-11-22T00:00:00Z'));
  assert.equal(evidence.title, new URL(fixture).hostname);
  assert.equal(evidence.headings.length, 10);
  assert.deepEqual(evidence.visiblePriceText, ['$119', 'USD 119']);
  assert.deepEqual(evidence.ctas, ['Buy now']);
  assert.equal(evidence.capturedAt, '2026-11-22T00:00:00.000Z');
});

test('the serialized page reader captures supported currencies without partial prices', () => {
  const parent = {
    closest: () => null,
    getClientRects: () => [1],
    getBoundingClientRect: () => ({ width: 200, height: 20, right: 200, bottom: 20 }),
  };
  const nodes = ['USD 1234567890 and 1234,5678 USD', 'USD 119 and $89', 'EUR 1 299,5', 'INR 875',
    'Packs are AU$45.50 and C$55', '500 ¥', 'The card says 8,00€.'].map((nodeValue) => ({ nodeValue, parentElement: parent }));
  const emptyQuery = () => [];
  const document = {
    title: 'Public landing page',
    querySelector: () => ({ querySelectorAll: emptyQuery }),
    querySelectorAll: emptyQuery,
    createTreeWalker: () => {
      let index = 0;
      return { nextNode() { this.currentNode = nodes[index++]; return this.currentNode; } };
    },
  };
  const result = runInNewContext(`(${readLandingPage.toString()})(${JSON.stringify(fixture)})`, {
    document, location: { href: fixture }, NodeFilter: { SHOW_TEXT: 4 }, window: { scrollY: 0 },
    getComputedStyle: () => ({ display: 'block', visibility: 'visible', opacity: '1', clip: 'auto' }),
  });
  assert.deepEqual([...result.visiblePriceText], ['USD 119', '$89', 'EUR 1 299,5', 'INR 875', 'AU$45.50', 'C$55', '500 ¥', '8,00€']);
});

function listen() {
  return {
    listener: null,
    addListener(listener) { this.listener = listener; },
  };
}

let mockSequence = 0;
async function worker() {
  const data = { writes: 0, permission: false, injections: 0, entries: new Map(), stored: {},
    tab: { id: 8, url: `${fixture}?utm_source=old`, incognito: false, active: true, windowId: 1 },
    dashboardTab: null, tabActions: [] };
  const internalEvent = listen();
  const externalEvent = listen();
  globalThis.chrome = {
    action: { onClicked: listen() },
    runtime: { id: extensionId, getURL: (path) => `${extensionUrl}${path}`, onMessage: internalEvent, onMessageExternal: externalEvent },
    storage: { session: {
      get: async (key) => structuredClone({ [key]: data.stored[key] }),
      set: async (patch) => Object.assign(data.stored, structuredClone(patch)),
    } },
    tabs: {
      get: async (id) => {
        assert.equal(id, workspace.tab.id);
        if (!data.dashboardTab) throw new Error('No tab');
        return data.dashboardTab;
      },
      query: async () => [data.tab],
      update: async (id, change) => { data.tabActions.push(['update', id, change]); },
      create: async (change) => { data.tabActions.push(['create', change]); },
      onRemoved: listen(),
    },
    windows: { update: async (id, change) => { data.tabActions.push(['window', id, change]); } },
    scripting: { executeScript: async ({ target: destination, args }) => {
      data.injections += 1;
      assert.equal(destination.tabId, data.tab.id);
      assert.equal(args[0], data.tab.url);
      return [{ result: { title: 'Everyday Essentials', headings: ['New Collection'], visiblePriceText: ['$119'], ctas: ['Shop now'] } }];
    } },
    permissions: { contains: async () => data.permission },
    bookmarks: {
      create: async (bookmark) => {
        data.writes += 1;
        const entry = { ...bookmark, id: String(data.writes + 10), parentId: '2' };
        data.entries.set(entry.id, entry);
        return entry;
      },
      get: async (id) => id === '2' ? [{ id, title: 'Other bookmarks', folderType: 'other' }] : [data.entries.get(id)],
    },
  };
  await import(`../service-worker.js?test=${++mockSequence}`);
  const send = (message, sender, event) => new Promise((resolve) => {
    if (!event.listener(message, sender, resolve)) resolve(null);
  });
  return {
    data,
    external: (message, sender = workspace) => send(message, sender, externalEvent),
    internal: (type, info, sender = panel) => send({ type, ...info }, sender, internalEvent),
  };
}

async function connect({ external, internal }) {
  assert.equal((await external(pair)).status, 'pending');
  const { pendingPair } = await internal('PANEL_STATE');
  assert.equal((await internal('PANEL_CONFIRM_PAIR', { reviewId: pendingPair.reviewId })).ok, true);
  assert.equal((await external(pair)).status, 'paired');
  const state = await internal('PANEL_STATE');
  return state.binding.reviewId;
}

test('dashboard handoff works without URL.canParse and opens a new tab when reassignment is unsafe', async (t) => {
  const instance = await worker();
  const { data, internal } = instance;
  await connect(instance);
  t.mock.method(URL, 'canParse', () => { throw new Error('Requires Chrome 120'); });
  data.dashboardTab = { ...workspace.tab, url: workspace.url, windowId: 1 };
  assert.equal((await internal('PANEL_OPEN_DASHBOARD')).status, 'focused');
  assert.deepEqual(data.tabActions, [['update', 4, { active: true }], ['window', 1, { focused: true }]]);
  data.dashboardTab = { ...data.dashboardTab, url: undefined };
  assert.equal((await internal('PANEL_OPEN_DASHBOARD')).status, 'opened');
  assert.deepEqual(data.tabActions.at(-1), ['create', { url: workspace.url }]);
  data.dashboardTab = null;
  assert.equal((await internal('PANEL_OPEN_DASHBOARD')).status, 'opened');
});

test('requires local pairing and capture, isolates origin, workspace, tab and session', async () => {
  const instance = await worker();
  const { data, external, internal } = instance;
  assert.equal((await external(capture)).code, 'NOT_PAIRED');
  assert.equal((await external(pair, { ...workspace, frameId: 1 })).code, 'FORBIDDEN_ORIGIN');
  assert.equal((await external(pair, { ...workspace, url: 'http://localhost:3001/app/', origin: 'http://localhost:3001' })).code, 'FORBIDDEN_ORIGIN');
  assert.equal((await external(pair, { ...workspace, tab: { ...workspace.tab, incognito: true } })).code, 'FORBIDDEN_ORIGIN');
  const pairId = await connect(instance);
  assert.equal((await external({ ...capture, workspaceId: 'other' })).code, 'NOT_PAIRED');
  assert.equal((await external({ ...capture, sessionId: 'other-session-123456' })).code, 'NOT_PAIRED');
  assert.equal((await external(capture, { ...workspace, tab: { ...workspace.tab, id: 9 } })).code, 'NOT_PAIRED');
  assert.equal((await external(capture, { ...workspace, url: 'http://localhost:3000/app/', origin: 'http://localhost:3000' })).code, 'NOT_PAIRED');
  assert.equal((await external(capture)).status, 'empty');
  assert.equal(data.injections, 0);
  assert.equal(await internal('PANEL_CAPTURE', { pairId, windowId: 1, tabId: 8, displayedUrl: fixture }, { ...panel, url: `${extensionUrl}other.html` }), null);
  assert.equal((await internal('PANEL_CAPTURE', { pairId, windowId: 1, tabId: 20, displayedUrl: fixture })).code, 'TAB_CHANGED');
  assert.equal((await internal('PANEL_CAPTURE', { pairId, windowId: 1, tabId: 8, displayedUrl: fixture })).ok, true);
  assert.equal(data.injections, 1);
  const pulled = await external(capture);
  assert.equal(pulled.status, 'captured');
  assert.equal(pulled.capture.url, fixture);
  assert.deepEqual(pulled.capture.visiblePriceText, ['$119']);
  await internal('PANEL_CLEAR_CAPTURE', { pairId });
  assert.equal((await external(capture)).status, 'empty');
  const disconnect = { ...capture, type: 'ROACLAW_DISCONNECT' };
  await external({ ...disconnect, sessionId: 'other-session-123456' });
  assert.equal((await external(capture)).status, 'empty');
  assert.equal((await external(disconnect)).status, 'disconnected');
  assert.equal((await external(capture)).code, 'NOT_PAIRED');
});

test('preflight capture stays bound to the campaign purpose, origin, tab, and session', async () => {
  const { data, external, internal } = await worker();
  assert.equal((await external(preflightPair)).code, 'BAD_INPUT');
  for (const path of ['/demo-store/', '/app/preflight-preview/', '/app/preflight/extra/']) {
    assert.equal((await external(preflightPair, { ...preflightPage, url: origin + path })).code, 'FORBIDDEN_ORIGIN');
  }
  assert.equal((await external(pair, preflightPage)).code, 'BAD_INPUT');
  assert.equal((await external(preflightPair, { ...preflightPage, frameId: 1 })).code, 'FORBIDDEN_ORIGIN');
  assert.equal((await external(preflightPair, preflightPage)).status, 'pending');
  assert.equal((await external(preflightCapture, preflightPage)).code, 'NOT_PAIRED');
  const { pendingPair } = await internal('PANEL_STATE');
  assert.equal(pendingPair.purpose, PREFLIGHT);
  assert.equal(pendingPair.workspaceName, preflightPair.workspaceName);
  assert.equal(pendingPair.destinationHost, preflightPair.destinationHost);
  assert.equal((await internal('PANEL_CONFIRM_PAIR', { reviewId: pendingPair.reviewId })).ok, true);
  assert.equal((await external(preflightPair, { ...preflightPage, url: preflightPage.url.slice(0, -1) })).status, 'paired');
  assert.equal((await external(preflightCapture, preflightPage)).status, 'empty');
  assert.equal(data.injections, 0);
  const approve = { pairId: pendingPair.reviewId, windowId: 1, tabId: 8, displayedUrl: fixture };
  assert.equal((await internal('PANEL_CAPTURE', approve)).ok, true);
  assert.equal(data.injections, 1);
  assert.equal((await external(preflightCapture, preflightPage)).capture.url, fixture);
  assert.equal((await external(capture, workspace)).code, 'NOT_PAIRED');
  assert.equal((await external(preflightCapture, { ...preflightPage, tab: { id: 7 } })).code, 'NOT_PAIRED');
  assert.equal((await external(preflightCapture, { ...preflightPage, origin: 'http://localhost:3000', url: 'http://localhost:3000/app/preflight/' })).code, 'NOT_PAIRED');
  assert.equal((await external(preflightRequest('ROACLAW_CAPTURE', { sessionId: 'other-session-123456' }), preflightPage)).code, 'NOT_PAIRED');
  assert.equal((await external({ ...propose, workspaceId: PREFLIGHT }, preflightPage)).code, 'BAD_INPUT');
  assert.equal((await external(preflightRequest('ROACLAW_DISCONNECT'), preflightPage)).status, 'disconnected');
  assert.equal((await internal('PANEL_STATE')).capture, null);
});

test('changed preflight metadata replaces review and clears capture before fresh consent', async () => {
  const { external, internal } = await worker();
  const send = (message) => external(message, preflightPage);
  await send(preflightPair);
  const first = (await internal('PANEL_STATE')).pendingPair;
  const renamed = { ...preflightPair, workspaceName: 'Updated Weekend Collection' };
  assert.equal((await send(renamed)).status, 'pending');
  assert.equal((await internal('PANEL_CONFIRM_PAIR', { reviewId: first.reviewId })).code, 'PAIR_STALE');
  const second = (await internal('PANEL_STATE')).pendingPair;
  assert.equal(second.workspaceName, renamed.workspaceName);
  await internal('PANEL_CONFIRM_PAIR', { reviewId: second.reviewId });
  await internal('PANEL_CAPTURE', { pairId: second.reviewId, windowId: 1, tabId: 8, displayedUrl: fixture });
  assert.equal((await send(preflightCapture)).status, 'captured');

  const updated = { ...renamed, destinationHost: 'new.example' };
  assert.equal((await send(updated)).status, 'pending');
  const pending = await internal('PANEL_STATE');
  assert.equal(pending.binding, null);
  assert.equal(pending.capture, null);
  assert.equal(pending.pendingPair.destinationHost, updated.destinationHost);
  assert.equal((await send(preflightCapture)).code, 'NOT_PAIRED');
  await internal('PANEL_CONFIRM_PAIR', { reviewId: pending.pendingPair.reviewId });
  assert.equal((await send(updated)).status, 'paired');
  assert.equal((await send(preflightCapture)).status, 'empty');
});

test('preflight handoff focuses the original tab and does not create a new session', async () => {
  const { data, external, internal } = await worker();
  await external(preflightPair, preflightPage);
  const { pendingPair } = await internal('PANEL_STATE');
  await internal('PANEL_CONFIRM_PAIR', { reviewId: pendingPair.reviewId });
  const handoff = () => internal('PANEL_OPEN_PREFLIGHT', { pairId: pendingPair.reviewId });
  data.dashboardTab = { ...preflightPage.tab, url: preflightPage.url, windowId: 3 };
  assert.equal((await handoff()).status, 'focused');
  data.dashboardTab.url = undefined;
  assert.equal((await handoff()).status, 'focused');
  const focus = [['update', 4, { active: true }], ['window', 3, { focused: true }]];
  assert.deepEqual(data.tabActions, [...focus, ...focus]);
  data.dashboardTab.url = workspace.url;
  assert.equal((await handoff()).code, 'PREFLIGHT_TAB_UNAVAILABLE');
  data.dashboardTab.url = preflightPage.url;
  data.dashboardTab.pendingUrl = workspace.url;
  assert.equal((await handoff()).code, 'PREFLIGHT_TAB_UNAVAILABLE');
  data.dashboardTab = null;
  assert.equal((await handoff()).code, 'PREFLIGHT_TAB_UNAVAILABLE');
  assert.deepEqual(data.tabActions, [...focus, ...focus]);
});

test('bookmark requires two panel clicks, optional permission, verified readback and idempotency', async () => {
  const instance = await worker();
  const { data, external, internal } = instance;
  const pairId = await connect(instance);
  assert.equal((await external(propose)).status, 'pending');
  assert.equal(data.writes, 0);
  const { proposal } = await internal('PANEL_STATE');
  const info = { pairId, reviewId: proposal.reviewId };
  assert.equal((await external({ ...propose, type: 'PANEL_SAVE_BOOKMARK', ...info })).code, 'BAD_INPUT');
  assert.equal((await internal('PANEL_SAVE_BOOKMARK', info)).code, 'ACTION_STALE');
  assert.equal((await internal('PANEL_APPROVE_BOOKMARK', info)).status, 'approved');
  assert.equal((await external(receipt)).status, 'approved');
  assert.equal((await internal('PANEL_SAVE_BOOKMARK', info)).code, 'PERMISSION_REQUIRED');
  assert.equal(data.writes, 0);
  data.permission = true;
  const saves = await Promise.all([internal('PANEL_SAVE_BOOKMARK', info), internal('PANEL_SAVE_BOOKMARK', info)]);
  const [result, replay] = saves;
  assert.equal(result.status, 'executed');
  assert.equal(replay.code, 'ACTION_STALE');
  assert.equal(result.receipt.folder, 'Other bookmarks');
  assert.equal(result.receipt.workspaceId, scope.workspaceId);
  assert.deepEqual(await external(receipt), result);
  assert.deepEqual(await external(propose), result);
  assert.equal(data.writes, 1);
  assert.equal((await external({ ...propose, proposal: { ...propose.proposal, url: fixture } })).code, 'ACTION_CONFLICT');

  const another = { ...propose, proposal: { ...propose.proposal, id: 'proposal-2' } };
  await external(another);
  const later = (await internal('PANEL_STATE')).proposal;
  const declined = await internal('PANEL_CANCEL_BOOKMARK', { pairId, reviewId: later.reviewId });
  assert.equal(declined.status, 'declined');
  assert.equal(data.writes, 1);
});

test('a restarted worker recovers verified writes without creating a duplicate', async () => {
  const instance = await worker();
  const { data, external } = instance;
  await connect(instance);
  await external(propose);
  const pending = data.stored.roaclawSession.proposals[0];
  Object.assign(pending, { status: 'executing', bookmarkId: '12', parentId: '2' });
  data.entries.set('12', { id: '12', title: pending.title, url: pending.url, parentId: '2' });
  assert.equal((await external(receipt)).status, 'executed');
  assert.equal(data.writes, 0);
  assert.equal((await external(receipt)).receipt.bookmarkId, '12');
});
