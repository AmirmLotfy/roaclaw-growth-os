import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { searchRecentHistory } from '../history.js';

const now = Date.parse('2026-11-22T11:00:00Z');
const day = 86_400_000;

test('requests scoped history access and exposes bounded, cleaned local metadata', async () => {
  let scope;
  const browser = {
    permissions: { request: async (grant) => { assert.deepEqual(grant, { permissions: ['history'] }); return true; } },
    history: { search: async (value) => {
      scope = value;
      return [
        { url: 'https://example.com/page?tracking=1#hero', title: 'Product', lastVisitTime: now - 100 },
        { url: 'https://example.com/page', title: 'Older', lastVisitTime: now - 200 },
        { url: 'https://example.com/login', title: 'Private', lastVisitTime: now - 100 },
        { url: 'http://192.168.0.1/product', title: 'Private', lastVisitTime: now - 100 },
        { url: 'https://example.com/old', title: 'Old', lastVisitTime: now - day - 100 },
      ];
    } },
  };
  const result = await searchRecentHistory(browser, ' product  ', { now });
  assert.deepEqual(scope, { text: 'product', startTime: now - day, endTime: now, maxResults: 12 });
  assert.deepEqual(result, { status: 'ready', entries: [{ url: 'https://example.com/page', title: 'Product', lastVisitedAt: now - 100 }] });
});

test('denial and cancellation never read history', async () => {
  const controller = new AbortController();
  const browser = { permissions: { request: async () => false }, history: { search: () => assert.fail('History must not be read') } };
  assert.deepEqual(await searchRecentHistory(browser, 'page', { now }), { status: 'denied' });
  browser.permissions.request = async () => { controller.abort(); return true; };
  assert.deepEqual(await searchRecentHistory(browser, 'page', { signal: controller.signal, now }), { status: 'canceled' });
  assert.deepEqual(await searchRecentHistory(browser, 'x', { now }), { status: 'invalid' });
});
