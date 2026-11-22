import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { safeCapture } from '../capture.js';
import { ORIGINS, parseExternal, publicPageUrl } from '../protocol.js';

const origin = 'https://roaclaw-growth-os-2026.web.app';
const scope = { workspaceId: 'weekend-co', sessionId: '12345678-1234-1234-1234-123456789012' };
const fixture = `${origin}/demo-store/`;
const target = `${fixture}?utm_source=meta&utm_medium=paid_social&utm_campaign=weekend-everyday-essentials`;
const workspace = { url: `${origin}/app/`, origin, frameId: 0, tab: { id: 4, incognito: false } };
const extensionId = 'loglkephefkogehklbohjpdnhdalgnmc';
const extensionUrl = `chrome-extension://${extensionId}/`;
const panel = { id: extensionId, url: `${extensionUrl}panel.html` };

const request = (type, extra) => ({ ...scope, type, ...extra });
const pair = request('ROACLAW_PAIR', { workspaceName: 'Weekend Co' });
const propose = request('ROACLAW_PROPOSE_BOOKMARK', { proposal: { id: 'proposal-1', title: 'Landing-page research', url: target } });
const receipt = request('ROACLAW_RECEIPT', { proposalId: propose.proposal.id });
const capture = request('ROACLAW_CAPTURE');

test('manifest keeps the development ID and grants no blanket host access', async () => {
  const manifest = JSON.parse(await readFile(new URL('../manifest.json', import.meta.url), 'utf8'));
  const keyDigest = createHash('sha256').update(Buffer.from(manifest.key, 'base64')).digest('hex').slice(0, 32);
  const id = [...keyDigest].map((c) => String.fromCharCode(97 + parseInt(c, 16))).join('');
  assert.equal(id, extensionId);
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

function listen() {
  return {
    listener: null,
    addListener(listener) { this.listener = listener; },
  };
}

let mockSequence = 0;
async function worker() {
  const data = { writes: 0, permission: false, injections: 0, entries: new Map(), stored: {},
    tab: { id: 8, url: `${fixture}?utm_source=old`, incognito: false, active: true, windowId: 1 } };
  const internalEvent = listen();
  const externalEvent = listen();
  globalThis.chrome = {
    action: { onClicked: listen() },
    runtime: { id: extensionId, getURL: (path) => `${extensionUrl}${path}`, onMessage: internalEvent, onMessageExternal: externalEvent },
    storage: { session: {
      get: async (key) => structuredClone({ [key]: data.stored[key] }),
      set: async (patch) => Object.assign(data.stored, structuredClone(patch)),
    } },
    tabs: { query: async () => [data.tab], onRemoved: listen() },
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
