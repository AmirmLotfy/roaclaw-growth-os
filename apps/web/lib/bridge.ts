'use client';

export const extensionId = 'loglkephefkogehklbohjpdnhdalgnmc';
const runtimeTimeout = 3500;

type Receipt = {
  proposalId: string;
  workspaceId: string;
  bookmarkId: string;
  title: string;
  url: string;
  folder: string;
  verifiedAt: string;
};

export type ExtensionReceipt = Receipt;

export type BridgeResponse = {
  ok: true;
  status: string;
  receipt?: Receipt;
  capture?: {
    url: string;
    title: string;
    headings: string[];
    visiblePriceText: string[];
    ctas: string[];
    capturedAt: string;
  };
};

const sessionPrefix = 'roaclaw.session.';

export function browserSession(uid: string, workspaceId: string) {
  const key = sessionPrefix + uid + '.' + workspaceId;
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  sessionStorage.setItem(key, created);
  return created;
}

export function clearBrowserSessions() {
  for (const key of Object.keys(sessionStorage)) {
    if (key.startsWith(sessionPrefix)) sessionStorage.removeItem(key);
  }
}

export function contactExtension(message: object): Promise<BridgeResponse> {
  const browser = globalThis as typeof globalThis & {
    chrome?: {
      runtime?: {
        lastError?: { message?: string };
        sendMessage: (id: string, input: object, callback: (response: unknown) => void) => void;
      };
    };
  };
  const runtime = browser.chrome?.runtime;
  if (!runtime?.sendMessage) return Promise.reject(new Error('Load the ROACLAW Chrome extension to continue.'));
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error('The Chrome extension did not respond.')), runtimeTimeout);
    runtime.sendMessage(extensionId, message, (response) => {
      window.clearTimeout(timeout);
      if (runtime.lastError) {
        reject(new Error('The extension is unavailable. Load it in Chrome and refresh this tab.'));
        return;
      }
      if (typeof response === 'object' && response && 'ok' in response && response.ok === true
        && 'status' in response && typeof response.status === 'string') {
        resolve(response as BridgeResponse);
        return;
      }
      const detail = typeof response === 'object' && response && 'message' in response ? response.message : null;
      reject(new Error(typeof detail === 'string' ? detail : 'The extension did not accept this request.'));
    });
  });
}
