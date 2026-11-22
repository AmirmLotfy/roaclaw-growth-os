export const preflightCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'EGP', 'AED', 'SAR'] as const;
const trackingKeys = ['utm_source', 'utm_medium', 'utm_campaign'] as const;

export type PreflightBrief = {
  offer: string;
  destination: string;
  cta: string;
  amount: string;
  currency: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
};
export type PreflightCapture = {
  url: string;
  title: string;
  headings: string[];
  visiblePriceText: string[];
  ctas: string[];
  capturedAt: string;
};
type Inspection = { source: 'on_device' | 'captured'; cta: string | null; priceUsd: number | null };
type Status = 'match' | 'mismatch' | 'review';
type Finding = { id: string; label: string; expected: string; observed: string; status: Status; detail: string };
export type PreflightReport = {
  brief: PreflightBrief;
  capture: PreflightCapture;
  source: Inspection['source'];
  rows: Finding[];
  correctedUrl: string | null;
  result: Status;
  checkedAt: string;
};

export const emptyBrief: PreflightBrief = {
  offer: '', destination: '', cta: '', amount: '', currency: 'USD',
  utm_source: '', utm_medium: '', utm_campaign: '',
};

function publicDestination(text: string) {
  try {
    const url = new URL(text);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      !/[a-z]/i.test(url.hostname) || !url.hostname.includes('.') ||
      /\.(?:test|invalid|localhost|local|internal|lan|home|example)\.?$/i.test(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

export function validateBrief(draft: PreflightBrief) {
  const brief = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value.trim()])) as PreflightBrief;
  const errors: Partial<Record<keyof PreflightBrief, string>> = {};
  if (!brief.offer || brief.offer.length > 100) errors.offer = 'Enter an offer name of up to 100 characters.';
  if (!brief.cta || brief.cta.length > 100) errors.cta = 'Enter the expected button label, up to 100 characters.';
  const url = publicDestination(brief.destination);
  if (!url || brief.destination.length > 2048) errors.destination = 'Enter the full public landing-page URL.';
  else if ([...url.searchParams.keys()].some((key) => /(?:token|password|passwd|session|secret|api[-_]?key|signature|^(?:auth|email|phone|code)$)/i.test(key))) {
    errors.destination = 'Remove private or sign-in parameters from the campaign destination.';
  }
  const currencyValid = preflightCurrencies.some((code) => code === brief.currency);
  if (!currencyValid) errors.currency = 'Choose a supported currency.';
  if (brief.amount) {
    const pattern = brief.currency === 'JPY' ? /^\d{1,9}$/ : /^\d{1,9}(?:\.\d{1,2})?$/;
    if (!pattern.test(brief.amount)) errors.amount = 'Enter a plain amount in the selected currency, such as 29.95.';
  }
  for (const key of trackingKeys) {
    if (brief[key].length > 100 || /[\p{Cc}\p{Cf}]/u.test(brief[key])) errors[key] = 'Use up to 100 characters and no control characters.';
  }
  return { brief, errors };
}

export async function inspectPreflight(capture: PreflightCapture): Promise<Inspection> {
  try {
    const { inspectPage } = await import('./inference');
    const inspection = await inspectPage({
      url: capture.url,
      title: capture.title,
      headings: capture.headings,
      prices: capture.visiblePriceText,
      ctas: capture.ctas,
      capturedAt: capture.capturedAt,
    }, 'local');
    if (inspection.source === 'on_device') {
      return { source: 'on_device', cta: inspection.fields.cta, priceUsd: inspection.fields.priceUsd };
    }
  } catch {
    // The capture remains useful when Nano is unavailable or the model cannot finish.
  }
  return { source: 'captured', cta: null, priceUsd: null };
}

const currencyMarks: Record<string, string> = {
  'US$': 'USD', 'CA$': 'CAD', 'C$': 'CAD', 'AU$': 'AUD', 'A$': 'AUD',
  '€': 'EUR', '£': 'GBP', '¥': 'JPY', '₹': 'INR',
};
const moneyPattern = /^(?:(?<prefix>US\$|CA\$|AU\$|[CA]\$|[$€£¥₹]|[A-Z]{3})\s*)?(?<amount>\d[\d.,\s]*?)(?:\s*(?<suffix>[A-Z]{3}|[$€£¥₹]))?$/i;

function capturedPrice(text: string, currency: string) {
  const parts = text.trim().match(moneyPattern)?.groups;
  const marker = parts?.prefix ?? parts?.suffix;
  if (!parts || !marker || (parts.prefix && parts.suffix)) return null;
  const code = currencyMarks[marker.toUpperCase()] ?? marker.toUpperCase();
  if (code !== currency && !(code === '$' && currency === 'USD')) return null;

  const raw = parts.amount.trim().replace(/[\s\u00a0\u202f]/g, ',');
  // The last separator is decimal only when followed by one or two digits.
  const decimal = currency === 'JPY' ? null : raw.match(/([.,])(\d{1,2})$/);
  const integer = decimal ? raw.slice(0, decimal.index) : raw;
  if (!/^\d+$/.test(integer) && !/^\d{1,3}([,.])\d{3}(?:\1\d{3})*$/.test(integer)) return null;
  if (decimal && integer.includes(decimal[1])) return null;
  const amount = Number(integer.replace(/[.,]/g, '') + (decimal ? '.' + decimal[2] : ''));
  return Number.isFinite(amount) ? { amount, literal: text, bareDollar: code === '$' } : null;
}

function normalize(value: string) {
  return value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
}

function matchesDestination(expected: URL | null, observed: URL | null) {
  if (!expected || !observed) return false;
  const path = (url: URL) => url.pathname.replace(/\/$/, '') || '/';
  return expected.origin === observed.origin && path(expected) === path(observed);
}

function summarize(rows: Finding[]): Status {
  if (rows.some(({ status }) => status === 'mismatch')) return 'mismatch';
  return rows.some(({ status }) => status === 'review') ? 'review' : 'match';
}

export function comparePreflight(
  brief: PreflightBrief,
  capture: PreflightCapture,
  inspection: Inspection,
  selectedPrice?: string,
): PreflightReport {
  const destination = publicDestination(brief.destination);
  const samePage = matchesDestination(destination, publicDestination(capture.url));
  const rows: Finding[] = [{
    id: 'destination', label: 'Landing page', expected: destination ? destination.origin + destination.pathname : brief.destination,
    observed: capture.url, status: samePage ? 'match' : 'review',
    detail: samePage ? 'The captured host and path match the brief. The extension strips page query strings and fragments.'
      : 'Capture the landing page from the brief. If the link redirects, verify the final public URL before updating the brief.',
  }];

  const productHeading = [...capture.headings, ...capture.title.split(/[|·]|\s+[-–—]\s+/)]
    .find((heading) => normalize(heading) === normalize(brief.offer));
  rows.push({
    id: 'offer', label: 'Advertised offer', expected: brief.offer, observed: productHeading ?? capture.headings[0] ?? capture.title,
    status: samePage && productHeading ? 'match' : 'review',
    detail: productHeading ? 'The offer name appears in the captured title or headings.' : 'The exact offer name was not found in the captured title or headings.',
  });

  if (brief.amount) {
    const candidates = capture.visiblePriceText
      .map((literal) => capturedPrice(literal, brief.currency))
      .filter((item) => item !== null);
    const chosen = selectedPrice && candidates.find(({ literal }) => literal === selectedPrice);
    const uniqueAmounts = new Set(candidates.map(({ amount }) => amount));
    const price = chosen || (uniqueAmounts.size === 1 ? candidates[0] : undefined);
    const priceStatus = samePage && productHeading && price
      ? price.amount === Number(brief.amount) ? 'match' : 'mismatch'
      : 'review';
    const detail = price
      ? (chosen ? 'The reviewer selected this price from the Chrome capture.'
        : inspection.source === 'on_device' && inspection.priceUsd === price.amount && brief.currency === 'USD'
          ? 'The device extraction agrees with the captured price.' : 'Chrome captured one distinct price in the selected currency.') +
        (price.bareDollar ? ' The dollar symbol is interpreted as USD from the brief.' : '')
      : candidates.length > 1 ? 'Chrome captured multiple prices. Choose the one beside the advertised offer.'
        : 'No usable price in this currency was found. Check the offer on the page.';
    rows.push({
      id: 'price', label: 'Advertised price', expected: new Intl.NumberFormat('en-US', { style: 'currency', currency: brief.currency }).format(Number(brief.amount)),
      observed: price ? price.literal : capture.visiblePriceText.join(' · ') || 'No price captured', status: priceStatus,
      detail: !samePage || !productHeading ? 'Verify the captured page and offer before comparing prices.' : detail,
    });
  }

  const buttonMatch = capture.ctas.find((button) => normalize(button) === normalize(brief.cta));
  rows.push({
    id: 'cta', label: 'Call to action', expected: brief.cta,
    observed: buttonMatch ?? ((inspection.cta
      ? [inspection.cta, ...capture.ctas.filter((label) => label !== inspection.cta)].join(' · ')
      : capture.ctas.join(' · ')) || 'No button labels captured'),
    status: samePage && buttonMatch ? 'match' : 'review',
    detail: buttonMatch ? 'The expected label appears among the captured buttons.'
      : 'The expected label was absent from the captured buttons. Check alternate wording or states on the page.',
  });

  const fix = samePage && destination ? new URL(destination) : null;
  let trackingChange = false;
  for (const key of trackingKeys) {
    const expected = brief[key];
    if (!expected || !destination) continue;
    const actual = destination.searchParams.getAll(key);
    const matches = actual.length === 1 && actual[0] === expected;
    rows.push({
      id: key, label: key, expected, observed: actual.length ? actual.join(' · ') : 'Missing',
      status: matches ? 'match' : 'mismatch',
      detail: 'Checked the campaign URL in the brief. This does not test analytics delivery.',
    });
    if (!matches && fix) {
      fix.searchParams.set(key, expected);
      trackingChange = true;
    }
  }

  return {
    brief, capture, source: inspection.source, rows,
    correctedUrl: trackingChange ? fix?.href ?? null : null,
    result: summarize(rows), checkedAt: new Date().toISOString(),
  };
}

function escapeHtml(value: string) {
  const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return value.replace(/[&<>"']/g, (character) => entities[character]);
}

export function preflightReportHtml(report: PreflightReport) {
  const h = escapeHtml;
  const status = { match: 'Match', mismatch: 'Differs', review: 'Needs review' };
  const rows = report.rows.map((row) =>
    `<tr><th scope="row">${h(row.label)}</th><td>${h(row.expected)}</td><td>${h(row.observed)}</td><td><strong>${status[row.status]}</strong><br>${h(row.detail)}</td></tr>`,
  ).join('');
  return `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">
<title>Campaign Preflight · ${h(report.brief.offer)}</title>
<style>
body{background:#edf1ec;color:#1d291f;font:16px/1.55 system-ui;margin:0}main{max-width:78rem;margin:auto;padding:clamp(1rem,5vw,4rem)}header{border-bottom:2px solid #345641;padding-block-end:1rem}h1{font-size:clamp(2rem,6vw,3.75rem);line-height:1.08;margin:.35em 0}h2{margin-block:1.6em .6em}dl{display:grid;grid-template-columns:max-content 1fr;gap:.3rem 1rem}dt{font-weight:700}dd{margin:0;overflow-wrap:anywhere}.scroll{overflow-x:auto}table{border-collapse:collapse;width:100%;background:#fefffc;min-width:34rem}th,td{padding:.8rem;text-align:left;vertical-align:top;border-bottom:1px solid #bfcdbf;overflow-wrap:anywhere}thead{background:#171e19;color:#fefffc}code{overflow-wrap:anywhere}small{display:block;margin-top:1.5rem}@media print{body,table,thead{background:white;color:black}main{padding:0}.scroll{overflow:visible}table{min-width:0}}
</style>
<main><header><strong>ROACLAW / CAMPAIGN PREFLIGHT</strong><h1>${h(report.brief.offer)}</h1><p>${status[report.result]} · ${report.source === 'on_device' ? 'Chrome device analysis via Firebase AI Logic' : 'Chrome capture comparison'}</p></header>
<dl><dt>Captured page</dt><dd>${h(report.capture.url)}</dd><dt>Captured at</dt><dd>${h(report.capture.capturedAt)}</dd><dt>Checked at</dt><dd>${h(report.checkedAt)}</dd></dl>
<h2>Evidence comparison</h2><div class="scroll"><table><thead><tr><th scope="col">Check</th><th scope="col">Campaign brief</th><th scope="col">Observed evidence</th><th scope="col">Result</th></tr></thead><tbody>${rows}</tbody></table></div>
${report.correctedUrl ? `<h2>Suggested campaign URL</h2><p><code>${h(report.correctedUrl)}</code></p>` : ''}
<small>Source: user-entered campaign brief and a time-stamped capture from Chrome. Check price variants, redirects and analytics delivery manually where evidence is incomplete.</small></main></html>`;
}
