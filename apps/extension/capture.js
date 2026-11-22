import { cleanText } from './protocol.js';

// Chrome serializes this function for execution in the tab's isolated world.
export function readLandingPage(expectedUrl) {
  if (location.href !== expectedUrl) return { reason: 'TAB_CHANGED' };

  const excluded = 'form, input, textarea, select, option, script, style, template, noscript, [hidden], [inert], [aria-hidden="true"], [role="textbox"], [contenteditable]:not([contenteditable="false"]), [autocomplete]';
  const privateInput = 'input[type="password"], input[autocomplete*="cc-"], input[autocomplete="one-time-code"]';
  const obviousIdentifier = /[\w.!#$%&'*+/=?^_`{|}~-]+@[\w.-]+\.[a-z]{2,}|(?:\+\d{1,3}[\s.-]*)?\(?\d{3}\)?[\s.-]+\d{3}[\s.-]+\d{4}|\b(?:\d[ -]?){13,19}\b|\b(?:api[-_ ]?key|bearer|password|passcode|access[-_ ]?token|refresh[-_ ]?token)\s*[:= ]\s*[a-z0-9._/-]{6,}|\b(?:eyJ[a-z0-9_-]{12,}|[a-z0-9_-]{42,})\b/i;
  const unsafeChars = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/u;
  const pricePattern = /(?<![\p{L}\d])(?:US\$|CA\$|A\$|[$€£¥₹]|USD|EUR|GBP|CAD|AUD|JPY|EGP|AED|SAR)\s?\d{1,6}(?:[,.]\d{2,3}){0,2}(?![\p{L}\d])|(?<![\p{L}\d])\d{1,6}(?:[,.]\d{2,3}){0,2}\s?(?:USD|EUR|GBP|CAD|AUD|JPY|EGP|AED|SAR)(?![\p{L}\d])/gu;
  const actionPattern = /\b(?:add to (?:cart|bag|basket)|book|buy|compare|contact|download|enquire|explore|get (?:a |an )?(?:demo|quote|started)|join|learn more|order|register|request|reserve|see pricing|shop|sign up|start|subscribe|try|view (?:the )?(?:collection|product|offer))\b/i;

  const visible = (element) => {
    if (!element || !element.getClientRects().length) return false;
    const rect = element.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2 || rect.right < 0 || rect.bottom + window.scrollY < 0) return false;
    for (let node = element; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) === 0 || style.contentVisibility === 'hidden' ||
          (style.clip !== 'auto' && style.clip !== '') || style.clipPath === 'inset(50%)') return false;
    }
    return true;
  };

  if ([...document.querySelectorAll(privateInput)].slice(0, 25).some(visible)) return { reason: 'PRIVATE_PAGE' };

  const clean = (text, max) => {
    if (!text || text.length > 1200 || obviousIdentifier.test(text) || unsafeChars.test(text)) return '';
    return text.replace(/\s+/g, ' ').trim().slice(0, max).trim();
  };

  const visibleText = (element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const parts = [];
    for (let count = 0; count < 36 && walker.nextNode(); count += 1) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      if (!parent || parent.closest(excluded) || !visible(parent)) continue;
      const text = clean(node.nodeValue, 260);
      if (text) parts.push(text);
    }
    return clean(parts.join(' '), 260);
  };

  const root = document.querySelector('main') ?? document.body;
  if (!root) return { reason: 'CAPTURE_FAILED' };
  const collect = (selector, limit, predicate = () => true) => {
    const found = new Set();
    const candidates = root.querySelectorAll(selector);
    for (let i = 0; i < Math.min(candidates.length, 160) && found.size < limit; i += 1) {
      const element = candidates[i];
      if (element.closest(excluded) || !visible(element)) continue;
      const text = visibleText(element);
      if (text && predicate(text, element)) found.add(text.slice(0, 160));
    }
    return [...found];
  };

  const prices = new Set();
  const addPrices = (text) => {
    for (const match of text.matchAll(pricePattern)) {
      if (prices.size >= 8) break;
      prices.add(match[0]);
    }
    return true;
  };
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let count = 0; count < 600 && prices.size < 8 && walker.nextNode(); count += 1) {
    const node = walker.currentNode;
    const text = clean(node.nodeValue, 260);
    const parent = node.parentElement;
    if (text && parent && !parent.closest(excluded) && visible(parent)) addPrices(text);
  }
  if (prices.size < 8) collect('[itemprop="price"], [data-price], [class*="price" i]', 16, addPrices);

  return {
    title: clean(document.title, 160),
    headings: collect('h1, h2, h3, [role="heading"]', 10),
    visiblePriceText: [...prices],
    ctas: collect('button, [role="button"], a[href]', 10, (text, element) => element.tagName !== 'A' || actionPattern.test(text) || element.getAttribute('role') === 'button'),
  };
}

export function safeCapture(result, url, date = new Date()) {
  const limit = (items, count, length) => [...new Set(items.map((item) => cleanText(item, length)).filter(Boolean))].slice(0, count);
  return {
    url,
    title: cleanText(result.title, 160) || new URL(url).hostname,
    headings: limit(result.headings, 10, 160),
    visiblePriceText: limit(result.visiblePriceText, 8, 40),
    ctas: limit(result.ctas, 10, 160),
    capturedAt: date.toISOString(),
  };
}
