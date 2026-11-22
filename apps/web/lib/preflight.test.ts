import { describe, expect, it } from 'vitest';
import { comparePreflight, emptyBrief, preflightReportHtml, validateBrief, type PreflightCapture } from './preflight';

const brief = {
  ...emptyBrief,
  offer: 'Studio Lamp', destination: 'https://shop.mybrand.com/lighting/lamp?variant=white&utm_medium=paid_social',
  cta: 'Add to cart', amount: '39.00', utm_source: 'newsletter', utm_campaign: 'studio-launch',
};
const capture: PreflightCapture = {
  url: 'https://shop.mybrand.com/lighting/lamp/',
  title: 'Studio Lamp | Shop',
  headings: ['Studio Lamp'],
  visiblePriceText: ['$49.00'],
  ctas: ['Add to cart', 'Read reviews'],
  capturedAt: '2026-11-22T12:00:00.000Z',
};
const local = { source: 'on_device' as const, cta: 'Add to cart', priceUsd: 49 };

describe('campaign preflight', () => {
  it('compares the confirmed page to the operator brief and preserves variant parameters in a proposed fix', () => {
    const report = comparePreflight(brief, capture, local);
    const statuses = Object.fromEntries(report.rows.map(({ id, status }) => [id, status]));
    expect(statuses).toEqual({ destination: 'match', offer: 'match', price: 'mismatch', cta: 'match', utm_source: 'mismatch', utm_campaign: 'mismatch' });
    expect(report.result).toBe('mismatch');
    expect(report.correctedUrl).toBe(brief.destination + '&utm_source=newsletter&utm_campaign=studio-launch');
  });

  it('asks for review on ambiguous prices and accepts a literal only from the current capture', () => {
    const multiple = { ...capture, visiblePriceText: ['$49.00', '$17.00'] };
    const row = (selected?: string) => comparePreflight(brief, multiple, local, selected).rows.find(({ id }) => id === 'price');
    expect(row()).toMatchObject({ status: 'review' });
    expect(row('$39.00')).toMatchObject({ status: 'review' });
    expect(row('$49.00')).toMatchObject({ status: 'mismatch', observed: '$49.00' });
  });

  it('recognizes prices in the selected currency without converting a foreign or ambiguous amount', () => {
    const european = { ...brief, currency: 'EUR', amount: '1299.95' };
    const price = (literal: string) => comparePreflight(european, { ...capture, visiblePriceText: [literal] }, local).rows.find(({ id }) => id === 'price')?.status;
    expect(price('1.299,95 EUR')).toBe('match');
    expect(price('€1,299.95')).toBe('match');
    expect(price('$1,299.95')).toBe('review');
    expect(price('€1.29.95')).toBe('review');
  });

  it('withholds a corrected URL and prevents a price conclusion when the wrong page is captured', () => {
    const report = comparePreflight(brief, { ...capture, url: 'https://shop.mybrand.com/sale' }, local);
    expect(report.correctedUrl).toBeNull();
    expect(report.rows.find(({ id }) => id === 'price')?.status).toBe('review');
  });

  it('normalizes duplicated campaign tags without removing unrelated parameters', () => {
    const report = comparePreflight({ ...brief, destination: brief.destination + '&utm_source=newsletter&utm_source=old' }, capture, local);
    const params = new URL(report.correctedUrl!).searchParams;
    expect(params.getAll('utm_source')).toEqual(['newsletter']);
    expect(params.get('variant')).toBe('white');
  });

  it('accepts a lead-generation brief without a price and reviews an unobserved CTA', () => {
    const report = comparePreflight({ ...brief, amount: '', cta: 'Book a consultation', utm_source: '', utm_campaign: '' }, capture, local);
    expect(report.result).toBe('review');
    expect(report.rows.some(({ id }) => id === 'price')).toBe(false);
    expect(report.rows.find(({ id }) => id === 'cta')?.status).toBe('review');
  });

  it('rejects private or non-web destinations and exports only escaped static markup', () => {
    for (const destination of ['https://user:pass@shop.mybrand.com/', 'javascript:alert(1)', 'http://127.1/', 'https://host.internal/', 'https://shop.mybrand.com/?session_id=abc']) {
      expect(validateBrief({ ...brief, destination }).errors.destination).toBeTruthy();
    }
    expect(validateBrief({ ...brief, amount: '3.50', currency: 'JPY' }).errors.amount).toBeTruthy();
    expect(validateBrief(brief).errors).toEqual({});
    const html = preflightReportHtml(comparePreflight({ ...brief, offer: '</title><script>click</script>' }, capture, local));
    expect(html).toContain('&lt;script&gt;click&lt;/script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).toContain("default-src 'none'");
  });
});
