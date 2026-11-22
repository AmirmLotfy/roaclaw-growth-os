import { readLandingPage, safeCapture } from './capture.js';
import { matchesScope, ORIGINS, parseExternal, PRIMARY_ORIGIN, publicPageUrl, responseError, senderScope } from './protocol.js';

const STATE_KEY = 'roaclawSession';
const PAIR_REQUEST_TTL = 2 * 60_000;
const PAIR_TTL = 60 * 60_000;
const CAPTURE_TTL = 15 * 60_000;
const ACTION_TTL = 10 * 60_000;
const ACTION_LIMIT = 32;
const finishedActions = new Set(['executed', 'declined', 'expired', 'verification_failed']);
let operations = Promise.resolve();

function serial(operation) {
  const result = operations.then(operation);
  operations = result.catch(() => undefined);
  return result;
}

function reply(operation, sendResponse) {
  serial(operation).then(sendResponse, () => sendResponse(responseError('INTERNAL')));
  return true;
}

const emptyState = () => ({ binding: null, pendingPair: null, capture: null, proposals: [] });
const save = (state) => chrome.storage.session.set({ [STATE_KEY]: state });

async function load() {
  const stored = await chrome.storage.session.get(STATE_KEY);
  const state = stored[STATE_KEY] ?? emptyState();
  const now = Date.now();
  let changed = false;
  if (state.binding && state.binding.expiresAt <= now) {
    state.binding = null;
    state.capture = null;
    state.proposals = [];
    changed = true;
  }
  if (state.pendingPair && state.pendingPair.expiresAt <= now) {
    state.pendingPair = null;
    changed = true;
  }
  if (state.capture && state.capture.expiresAt <= now) {
    state.capture = null;
    changed = true;
  }
  for (const item of state.proposals) {
    if (item.status === 'executing') {
      await verifyBookmark(state, item);
    } else if (!finishedActions.has(item.status) && item.expiresAt <= now) {
      item.status = 'expired';
      changed = true;
    }
  }
  if (changed) await save(state);
  return state;
}

function actionResponse(item) {
  if (!item) return { ok: true, status: 'empty' };
  if (item.receipt) return { ok: true, status: item.status, receipt: item.receipt };
  return { ok: true, status: item.status };
}

async function fromWorkspace(message, sender) {
  const senderIdentity = senderScope(sender);
  if (!senderIdentity) return responseError('FORBIDDEN_ORIGIN');
  const request = parseExternal(message, senderIdentity.origin);
  if (!request) return responseError('BAD_INPUT');
  const scope = { ...senderIdentity, workspaceId: request.workspaceId, sessionId: request.sessionId };
  const state = await load();
  const paired = matchesScope(state.binding, scope);

  if (request.type === 'ROACLAW_PAIR') {
    if (paired) return { ok: true, status: 'paired' };
    if (matchesScope(state.pendingPair, scope)) return { ok: true, status: 'pending' };
    if (state.pendingPair) return responseError('PAIR_BUSY');
    state.pendingPair = {
      ...scope,
      workspaceName: request.workspaceName,
      reviewId: crypto.randomUUID(),
      expiresAt: Date.now() + PAIR_REQUEST_TTL,
    };
    await save(state);
    return { ok: true, status: 'pending' };
  }

  if (request.type === 'ROACLAW_DISCONNECT') {
    if (paired) {
      state.binding = null;
      state.capture = null;
      state.proposals = [];
    }
    if (matchesScope(state.pendingPair, scope)) state.pendingPair = null;
    await save(state);
    return { ok: true, status: 'disconnected' };
  }

  if (!paired) return responseError('NOT_PAIRED');

  if (request.type === 'ROACLAW_CAPTURE') {
    if (!state.capture) return { ok: true, status: 'empty' };
    return { ok: true, status: 'captured', capture: state.capture.value };
  }
  if (request.type === 'ROACLAW_RECEIPT') return actionResponse(state.proposals.find(({ id }) => id === request.proposalId));

  const prior = state.proposals.find(({ id }) => id === request.proposal.id);
  if (prior) {
    if (prior.title !== request.proposal.title || prior.url !== request.proposal.url) return responseError('ACTION_CONFLICT');
    return actionResponse(prior);
  }
  if (state.proposals.some(({ status }) => !finishedActions.has(status))) return responseError('ACTION_BUSY');
  if (state.proposals.length >= ACTION_LIMIT) return responseError('ACTION_LIMIT');
  const item = {
    ...request.proposal,
    reviewId: crypto.randomUUID(),
    status: 'pending',
    expiresAt: Date.now() + ACTION_TTL,
  };
  state.proposals.push(item);
  await save(state);
  return actionResponse(item);
}

function viewBinding(binding) {
  if (!binding) return null;
  const { workspaceId, workspaceName, origin, expiresAt, reviewId } = binding;
  return { workspaceId, workspaceName, origin, expiresAt, reviewId };
}

async function capture(state, windowId, tabId, displayedUrl) {
  if (!Number.isSafeInteger(windowId) || !Number.isSafeInteger(tabId)) return responseError('TAB_UNAVAILABLE');
  const [tab] = await chrome.tabs.query({ active: true, windowId });
  if (!tab?.url || tab.incognito) return responseError('TAB_UNAVAILABLE');
  const url = publicPageUrl(tab.url);
  if (!url) return responseError('PRIVATE_PAGE');
  if (tab.id !== tabId || url !== displayedUrl || tab.pendingUrl) return responseError('TAB_CHANGED');

  let result;
  try {
    [{ result } = {}] = await chrome.scripting.executeScript({ target: { tabId }, func: readLandingPage, args: [tab.url] });
  } catch {
    return responseError('CAPTURE_FAILED');
  }
  if (!result) return responseError('CAPTURE_FAILED');
  if (result.reason) return responseError(result.reason);
  const [after] = await chrome.tabs.query({ active: true, windowId });
  if (after?.id !== tabId || after.url !== tab.url || after.pendingUrl) return responseError('TAB_CHANGED');
  if (state.binding.expiresAt <= Date.now()) return responseError('NOT_PAIRED');
  const value = safeCapture(result, url);
  state.capture = { value, expiresAt: Date.now() + CAPTURE_TTL };
  await save(state);
  return { ok: true, capture: value };
}

async function verifyBookmark(state, item) {
  try {
    if (!item.bookmarkId || !item.parentId) throw new Error('Bookmark result unavailable');
    const [[entry], [folder]] = await Promise.all([chrome.bookmarks.get(item.bookmarkId), chrome.bookmarks.get(item.parentId)]);
    if (entry?.title !== item.title || entry.url !== item.url || entry.parentId !== item.parentId || !folder?.title ||
        (folder.folderType && folder.folderType !== 'other')) throw new Error('Bookmark readback did not match');
    item.receipt = {
      proposalId: item.id,
      workspaceId: state.binding.workspaceId,
      bookmarkId: entry.id,
      title: entry.title,
      url: entry.url,
      folder: folder.title,
      verifiedAt: new Date().toISOString(),
    };
    item.status = 'executed';
  } catch {
    item.status = 'verification_failed';
  }
  await save(state);
  return actionResponse(item);
}

async function saveBookmark(state, item) {
  if (!(await chrome.permissions.contains({ permissions: ['bookmarks'] }))) return responseError('PERMISSION_REQUIRED');
  item.status = 'executing';
  await save(state);

  try {
    // The API uses Other Bookmarks when parentId is absent.
    const created = await chrome.bookmarks.create({ title: item.title, url: item.url });
    item.bookmarkId = created.id;
    item.parentId = created.parentId;
  } catch {
    item.status = 'verification_failed';
    await save(state);
    return actionResponse(item);
  }
  await save(state);
  return verifyBookmark(state, item);
}

async function openDashboard(binding) {
  const origin = ORIGINS.has(binding?.origin) ? binding.origin : PRIMARY_ORIGIN;
  const destination = new URL('/app/', origin);
  if (binding) {
    const existingTab = await chrome.tabs.get(binding.tabId).catch(() => null);
    const existingPage = URL.canParse(existingTab?.url) ? new URL(existingTab.url) : null;
    if (!existingTab?.incognito && existingPage?.origin === origin && ['/app', '/app/'].includes(existingPage.pathname)) {
      await chrome.tabs.update(existingTab.id, { active: true });
      await chrome.windows.update(existingTab.windowId, { focused: true });
      return { ok: true, status: 'focused' };
    }
  }
  await chrome.tabs.create({ url: destination.href });
  return { ok: true, status: 'opened' };
}

async function fromPanel(message) {
  const state = await load();
  if (message.type === 'PANEL_OPEN_DASHBOARD') return openDashboard(state.binding);
  if (message.type === 'PANEL_STATE') {
    return {
      ok: true,
      binding: viewBinding(state.binding),
      pendingPair: viewBinding(state.pendingPair),
      capture: state.capture?.value ?? null,
      proposal: state.proposals.at(-1) ?? null,
    };
  }

  if (message.type === 'PANEL_CONFIRM_PAIR' || message.type === 'PANEL_DECLINE_PAIR') {
    if (!state.pendingPair || state.pendingPair.reviewId !== message.reviewId) return responseError('PAIR_STALE');
    if (message.type === 'PANEL_CONFIRM_PAIR') {
      state.binding = { ...state.pendingPair, expiresAt: Date.now() + PAIR_TTL };
      state.capture = null;
      state.proposals = [];
    }
    state.pendingPair = null;
    await save(state);
    return { ok: true };
  }

  if (!state.binding || state.binding.reviewId !== message.pairId) return responseError('NOT_PAIRED');
  if (message.type === 'PANEL_DISCONNECT') {
    await save(emptyState());
    return { ok: true };
  }
  if (message.type === 'PANEL_CAPTURE') return capture(state, message.windowId, message.tabId, message.displayedUrl);
  if (message.type === 'PANEL_CLEAR_CAPTURE') {
    state.capture = null;
    await save(state);
    return { ok: true };
  }

  const item = state.proposals.find(({ reviewId }) => reviewId === message.reviewId);
  if (!item) return responseError('ACTION_STALE');
  if (message.type === 'PANEL_APPROVE_BOOKMARK' && item.status === 'pending') {
    item.status = 'approved';
  } else if (message.type === 'PANEL_CANCEL_BOOKMARK' && ['pending', 'approved'].includes(item.status)) {
    item.status = 'declined';
  } else if (message.type === 'PANEL_SAVE_BOOKMARK' && item.status === 'approved') {
    return saveBookmark(state, item);
  } else {
    return responseError('ACTION_STALE');
  }
  await save(state);
  return actionResponse(item);
}

chrome.action.onClicked.addListener((tab) => {
  if (!Number.isSafeInteger(tab.windowId) || tab.incognito) return;
  void chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => undefined);
  void chrome.runtime.sendMessage({ type: 'ROACLAW_TOOLBAR_INVOKED', windowId: tab.windowId }).catch(() => undefined);
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => reply(() => fromWorkspace(message, sender), sendResponse));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id || sender.url !== chrome.runtime.getURL('panel.html') || !message || typeof message !== 'object') return false;
  return reply(() => fromPanel(message), sendResponse);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  void serial(async () => {
    const state = await load();
    if (state.binding?.tabId === tabId) {
      state.binding = null;
      state.capture = null;
      state.proposals = [];
    } else if (state.pendingPair?.tabId !== tabId) {
      return;
    }
    if (state.pendingPair?.tabId === tabId) state.pendingPair = null;
    await save(state);
  }).catch(() => undefined);
});
