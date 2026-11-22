import { searchRecentHistory } from './history.js';
import { ERRORS, publicPageUrl } from './protocol.js';

const $ = (id) => document.getElementById(id);
const show = (id, visible) => { $(id).hidden = !visible; };
const text = (id, value) => { $(id).textContent = value; };
const bookmarkPermission = { permissions: ['bookmarks'] };
const actionCopy = {
  pending: ['Awaiting review', 'Check the address and folder before continuing.'],
  approved: ['Ready to save', 'Chrome may ask for bookmark access before saving.'],
  executed: ['Verified in Chrome', ''],
  declined: ['Declined', 'The bookmark request was declined.'],
  expired: ['Expired', 'The request expired before it was saved.'],
  verification_failed: ['Could not verify', 'Check Other bookmarks in Chrome before requesting another save.'],
};

let windowId;
let activePage = null;
let state = {};
let busy = false;
let refreshIndex = 0;
let historyRequest;
let activeView = 'inspect';
const views = ['inspect', 'actions', 'research'];

function notice(message, error = false) {
  $('notice').classList.toggle('error', error);
  text('notice', message);
  show('notice', Boolean(message));
}

function detail(label, value) {
  const term = document.createElement('dt');
  const description = document.createElement('dd');
  term.textContent = label;
  description.textContent = value;
  return [term, description];
}

function setButtons() {
  for (const button of document.querySelectorAll('main button')) button.disabled = busy;
  $('capture').disabled = busy || !state.binding || !activePage?.url;
  $('clear-history').disabled = false;
}

function renderCapture(capture) {
  show('capture-review', Boolean(capture));
  if (!capture) {
    $('capture-fields').replaceChildren();
    return;
  }
  text('capture-title', capture.title);
  text('capture-url', capture.url);
  const counts = [
    [capture.headings.length, 'heading'],
    [capture.visiblePriceText.length, 'price'],
    [capture.ctas.length, 'call to action'],
  ];
  text('capture-counts', counts.map(([count, label]) => `${count} ${label}${count === 1 ? '' : 's'}`).join(' · '));
  $('capture-fields').replaceChildren(
    ...detail('Headings', capture.headings.join(' · ') || 'None captured'),
    ...detail('Prices', capture.visiblePriceText.join(' · ') || 'None captured'),
    ...detail('Calls to action', capture.ctas.join(' · ') || 'None captured'),
  );
}

function renderAction(proposal) {
  show('bookmark', Boolean(proposal));
  show('no-action', !proposal);
  show('action-status', Boolean(proposal));
  if (!proposal) return;
  const [status, description] = actionCopy[proposal.status] ?? ['Verifying', 'Checking the saved bookmark in Chrome.'];
  const active = ['pending', 'approved'].includes(proposal.status);
  text('actions-title', active ? 'Confirm bookmark' : proposal.receipt ? 'Bookmark receipt' : 'Bookmark request');
  text('action-status', status);
  $('action-status').dataset.tone = proposal.status === 'executed' ? 'success' : proposal.status === 'verification_failed' ? 'error' : active ? 'warning' : 'neutral';
  text('bookmark-title', proposal.title);
  text('bookmark-url', proposal.url);
  text('bookmark-folder', proposal.receipt?.folder ?? 'Other bookmarks');
  text('bookmark-copy', description);
  show('bookmark-copy', Boolean(description));
  show('bookmark-id-row', Boolean(proposal.receipt));
  text('bookmark-id', proposal.receipt?.bookmarkId ?? '');
  show('bookmark-buttons', active);
  show('review-bookmark', proposal.status === 'pending');
  show('save-bookmark', proposal.status === 'approved');
}

function render() {
  const { binding, pendingPair, capture, proposal } = state;
  text('workspace-name', binding?.workspaceName ?? 'Connect a workspace');
  text('workspace-origin', binding?.origin ?? 'Request pairing in Growth Audit.');
  $('workspace-origin').classList.toggle('technical', Boolean(binding));
  show('disconnect', Boolean(binding));
  show('pair-review', Boolean(pendingPair));
  if (pendingPair) {
    text('pair-name', pendingPair.workspaceName);
    text('pair-origin', pendingPair.origin);
    text('pair-copy', binding
      ? 'Switching clears the previous workspace’s capture and action history from this panel.'
      : 'This workspace can retrieve your captures and propose bookmarks for review.');
    text('confirm-pair', binding ? 'Switch workspace' : 'Connect workspace');
  }

  show('panel-nav', Boolean(binding));
  for (const view of views) {
    const selected = view === activeView;
    const tab = $('panel-' + view + '-tab');
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    show(view, Boolean(binding) && selected);
  }
  if (binding) {
    text('page-state', activePage?.url ? 'Ready to capture' : 'Tab access needed');
    $('page-state').dataset.tone = activePage?.url ? 'success' : 'warning';
    show('page-url', Boolean(activePage?.url));
    text('page-url', activePage?.url ?? '');
    text('page-help', activePage?.url
      ? 'Capture the page title, headings, prices, and action labels for this workspace.'
      : activePage?.blocked ? 'Open a public landing page to capture evidence.' : ERRORS.TAB_UNAVAILABLE);
  }
  renderCapture(capture);
  renderAction(proposal);
  setButtons();
}

async function refresh() {
  const index = ++refreshIndex;
  try {
    const [updated, [tab]] = await Promise.all([
      chrome.runtime.sendMessage({ type: 'PANEL_STATE' }),
      chrome.tabs.query({ active: true, windowId }),
    ]);
    if (index !== refreshIndex) return;
    if (!updated?.ok) throw new Error(ERRORS.INTERNAL);
    if (state.binding?.reviewId !== updated.binding?.reviewId) {
      activeView = 'inspect';
      $('search-results').replaceChildren();
      $('search-form').reset();
      resetHistory();
    }
    if (updated.proposal?.status === 'pending' && updated.proposal.reviewId !== state.proposal?.reviewId) activeView = 'actions';
    state = updated;
    if (tab?.url && !tab.incognito) {
      const url = publicPageUrl(tab.url);
      activePage = { id: tab.id, url, blocked: !url };
    } else {
      activePage = null;
    }
    render();
  } catch {
    if (index === refreshIndex) notice(ERRORS.INTERNAL, true);
  }
}

async function run(message, success, permissionPromise) {
  if (busy) return;
  const pairId = state.binding?.reviewId;
  busy = true;
  setButtons();
  notice('');
  try {
    if (permissionPromise && !(await permissionPromise)) {
      notice(ERRORS.PERMISSION_REQUIRED, true);
      return;
    }
    const response = await chrome.runtime.sendMessage({ ...message, pairId });
    if (!response?.ok) {
      notice(response?.message ?? ERRORS.INTERNAL, true);
    } else if (response.status === 'verification_failed') {
      notice(actionCopy.verification_failed[1], true);
    } else if (success) {
      notice(success);
    }
  } catch {
    notice(ERRORS.INTERNAL, true);
  } finally {
    busy = false;
    setButtons();
    await refresh();
  }
}

function pairAction(type, success) {
  if (state.pendingPair) void run({ type, reviewId: state.pendingPair.reviewId }, success);
}

function bookmarkAction(type, success) {
  if (!state.proposal || busy) return;
  const permission = type === 'PANEL_SAVE_BOOKMARK' ? chrome.permissions.request(bookmarkPermission) : null;
  void run({ type, reviewId: state.proposal.reviewId }, success, permission);
}

async function searchBookmarks(event) {
  event.preventDefault();
  const query = $('search-text').value.trim();
  const pairId = state.binding?.reviewId;
  if (!pairId || query.length < 2 || busy) return;
  const permission = chrome.permissions.request(bookmarkPermission);
  busy = true;
  setButtons();
  $('search-results').replaceChildren();
  notice('');
  try {
    if (!(await permission)) {
      notice('Allow Chrome bookmark access to search your bookmarks.', true);
      return;
    }
    const matches = await chrome.bookmarks.search(query);
    if (pairId !== state.binding?.reviewId) return;
    const fragment = document.createDocumentFragment();
    for (const entry of matches.filter(({ url }) => url).slice(0, 12)) {
      const row = document.createElement('li');
      const title = document.createElement('strong');
      const address = document.createElement('span');
      title.textContent = entry.title || 'Untitled bookmark';
      address.textContent = entry.url;
      address.classList.add('technical');
      row.append(title, address);
      fragment.append(row);
    }
    if (fragment.childNodes.length === 0) notice('No bookmarks match that search.');
    $('search-results').replaceChildren(fragment);
  } catch {
    notice('Chrome could not search your bookmarks.', true);
  } finally {
    busy = false;
    setButtons();
  }
}

function resetHistory() {
  historyRequest?.abort();
  $('history-form').reset();
  $('history-results').replaceChildren();
  show('clear-history', false);
}

async function searchHistory(event) {
  event.preventDefault();
  const query = $('history-text').value.trim();
  const pairId = state.binding?.reviewId;
  if (!pairId || busy) return;
  historyRequest?.abort();
  const controller = new AbortController();
  historyRequest = controller;
  busy = true;
  setButtons();
  notice('');
  $('history-results').replaceChildren();
  show('clear-history', true);
  try {
    const result = await searchRecentHistory(chrome, query, { signal: controller.signal });
    if (controller.signal.aborted || state.binding?.reviewId !== pairId) return;
    if (result.status !== 'ready') {
      if (result.status === 'denied') notice('Chrome history access was declined.', true);
      else if (result.status === 'invalid') notice('Enter 2 to 80 characters.', true);
      else if (result.status === 'error') notice('Chrome could not search recent history.', true);
      return;
    }
    for (const match of result.entries) {
      const row = document.createElement('li');
      const title = document.createElement('strong');
      const address = document.createElement('span');
      const when = document.createElement('time');
      title.textContent = match.title;
      address.textContent = match.url;
      address.className = 'technical';
      when.dateTime = new Date(match.lastVisitedAt).toISOString();
      when.textContent = new Date(match.lastVisitedAt).toLocaleString();
      row.append(title, address, when);
      $('history-results').append(row);
    }
    if (!result.entries.length) notice('No matching public pages in the last 24 hours.');
  } finally {
    busy = false;
    setButtons();
  }
}

function switchView(view, focus = false) {
  activeView = view;
  render();
  if (focus) $('panel-' + view + '-tab').focus();
}

function viewKeys(event) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const current = views.indexOf(activeView);
  const direction = event.key === 'ArrowRight' ? 1 : -1;
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? views.length - 1 : (current + direction + views.length) % views.length;
  switchView(views[next], true);
}

async function start() {
  try {
    ({ id: windowId } = await chrome.windows.getCurrent());
  } catch {
    notice(ERRORS.INTERNAL, true);
    return;
  }
  for (const view of views) {
    const tab = $('panel-' + view + '-tab');
    tab.addEventListener('click', () => switchView(view));
    tab.addEventListener('keydown', viewKeys);
  }
  $('open-dashboard').addEventListener('click', () => void run({ type: 'PANEL_OPEN_DASHBOARD' }));
  $('history-form').addEventListener('submit', searchHistory);
  $('clear-history').addEventListener('click', () => { resetHistory(); notice('History results cleared.'); });
  $('confirm-pair').addEventListener('click', () => pairAction('PANEL_CONFIRM_PAIR', 'Workspace connected.'));
  $('decline-pair').addEventListener('click', () => pairAction('PANEL_DECLINE_PAIR', 'Pairing request declined.'));
  $('disconnect').addEventListener('click', () => run({ type: 'PANEL_DISCONNECT' }, 'Workspace disconnected.'));
  $('clear-capture').addEventListener('click', () => run({ type: 'PANEL_CLEAR_CAPTURE' }, 'Page evidence cleared.'));
  $('capture').addEventListener('click', () => {
    if (!activePage?.url) return;
    void run({ type: 'PANEL_CAPTURE', windowId, tabId: activePage.id, displayedUrl: activePage.url }, 'Page evidence ready for the paired workspace.');
  });
  $('review-bookmark').addEventListener('click', () => bookmarkAction('PANEL_APPROVE_BOOKMARK'));
  $('save-bookmark').addEventListener('click', () => bookmarkAction('PANEL_SAVE_BOOKMARK', 'Bookmark saved and verified in Chrome.'));
  $('cancel-bookmark').addEventListener('click', () => bookmarkAction('PANEL_CANCEL_BOOKMARK', 'Bookmark request canceled.'));
  $('search-form').addEventListener('submit', searchBookmarks);
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'session' && changes.roaclawSession) void refresh();
  });
  chrome.tabs.onActivated.addListener((tab) => { if (tab.windowId === windowId) void refresh(); });
  chrome.tabs.onUpdated.addListener((tabId, _changes, tab) => { if (tab.active && tab.windowId === windowId) void refresh(); });
  chrome.runtime.onMessage.addListener((message, sender) => {
    if (sender.id === chrome.runtime.id && message?.type === 'ROACLAW_TOOLBAR_INVOKED' && message.windowId === windowId) {
      if (!['pending', 'approved'].includes(state.proposal?.status)) activeView = 'inspect';
      void refresh();
    }
  });
  window.setInterval(refresh, 15_000);
  await refresh();
}

void start();
