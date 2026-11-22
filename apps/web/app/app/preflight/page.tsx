'use client';

import {
  ArrowUpRight, Check, ChevronDown, CircleAlert, CircleHelp, ClipboardCheck, Cpu,
  Copy, Download, Link2, ScanLine, ShieldCheck, Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type InputHTMLAttributes } from 'react';
import { contactExtension } from '../../../lib/bridge';
import {
  comparePreflight, emptyBrief, inspectPreflight, preflightCurrencies, preflightReportHtml, validateBrief,
  type PreflightBrief, type PreflightCapture, type PreflightReport,
} from '../../../lib/preflight';
import './preflight.css';

const storageKey = 'roaclaw.preflight.draft';
const workspaceId = 'campaign-preflight';
const formId = 'preflight-brief';
const fields = Object.keys(emptyBrief) as (keyof PreflightBrief)[];
const trackingFields = ['utm_source', 'utm_medium', 'utm_campaign'] as const;
const statusLabels = { match: 'Match', mismatch: 'Mismatch', review: 'Needs review' };
const resultLabels = { match: 'All checks match', mismatch: 'Mismatches found', review: 'Review needed' };
const statusIcons = { match: Check, mismatch: CircleAlert, review: CircleHelp };

type Inspection = Awaited<ReturnType<typeof inspectPreflight>>;
type Errors = ReturnType<typeof validateBrief>['errors'];
type PairRequest = { sessionId: string; identity: string };
const capturedInspection: Inspection = { source: 'captured', cta: null, priceUsd: null };

function readDraft(): { brief: PreflightBrief; pair: PairRequest | null } {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null');
    const brief = { ...emptyBrief };
    for (const field of fields) {
      if (typeof saved?.brief?.[field] === 'string') brief[field] = saved.brief[field];
    }
    const pair = saved?.pair;
    return {
      brief,
      pair: typeof pair?.sessionId === 'string' && /^[A-Za-z0-9_-]{16,128}$/.test(pair.sessionId)
        && typeof pair.identity === 'string' ? { sessionId: pair.sessionId, identity: pair.identity } : null,
    };
  } catch {
    return { brief: { ...emptyBrief }, pair: null };
  }
}

function writeDraft(brief: PreflightBrief, pair: PairRequest | null) {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify({ brief, pair }));
  } catch {
    // The open workspace still works when the browser disables session storage.
  }
}

function formatTime(value: string) {
  return new Date(value).toLocaleString();
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'The request could not be completed. Try again.';
}

function downloadReport(report: PreflightReport) {
  const href = URL.createObjectURL(new Blob([preflightReportHtml(report)], { type: 'text/html;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = href;
  link.download = 'roaclaw-campaign-preflight.html';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 1000);
}

function Field({
  name, label, error, ...input
}: InputHTMLAttributes<HTMLInputElement> & { name: keyof PreflightBrief; label: string; error?: string }) {
  const id = `preflight-${name}`;
  return (
    <div className="field preflight-field">
      <label htmlFor={id}>{label}</label>
      <input {...input} id={id} name={name} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
      {error && <span id={`${id}-error`} className="preflight-field-error">{error}</span>}
    </div>
  );
}

function CheckStatus({ status, summary = false }: { status: PreflightReport['result']; summary?: boolean }) {
  const Icon = statusIcons[status];
  return (
    <span className={`preflight-check preflight-check--${status}`}>
      <Icon size={15} aria-hidden="true" />{summary ? resultLabels[status] : statusLabels[status]}
    </span>
  );
}

export default function CampaignPreflight() {
  const [draft, setDraft] = useState<PreflightBrief>(emptyBrief);
  const [errors, setErrors] = useState<Errors>({});
  const [pairState, setPairState] = useState<'unpaired' | 'pending' | 'paired'>('unpaired');
  const [destination, setDestination] = useState('');
  const [capture, setCapture] = useState<PreflightCapture | null>(null);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [selectedPrice, setSelectedPrice] = useState('');
  const [report, setReport] = useState<PreflightReport | null>(null);
  const [busy, setBusy] = useState('');
  const [deviceBusy, setDeviceBusy] = useState(false);
  const [deviceNotice, setDeviceNotice] = useState('');
  const [copyNotice, setCopyNotice] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const pair = useRef<PairRequest | null>(null);
  const captureRevision = useRef(0);
  const priceChoice = useRef<HTMLSelectElement>(null);
  const correctedLink = useRef<HTMLElement>(null);

  useEffect(() => {
    const saved = readDraft();
    pair.current = saved.pair;
    setDraft(saved.brief);
  }, []);

  function resetEvidence() {
    captureRevision.current += 1;
    setCapture(null);
    setInspection(null);
    setSelectedPrice('');
    setReport(null);
    setDeviceNotice('');
    setCopyNotice('');
  }

  function edit(field: keyof PreflightBrief, value: string) {
    const next = { ...draft, [field]: value };
    setDraft(next);
    writeDraft(next, pair.current);
    setErrors({ ...errors, [field]: undefined });
    setReport(null);
    setCopyNotice('');
    setNotice('');
    setError('');
    if (field === 'destination' || field === 'offer') {
      setDestination('');
      setPairState('unpaired');
      resetEvidence();
    }
  }

  function validBrief() {
    const result = validateBrief(draft);
    setErrors(result.errors);
    const firstError = fields.find((field) => result.errors[field]);
    if (!firstError) return result.brief;
    window.requestAnimationFrame(() => document.getElementById(`preflight-${firstError}`)?.focus());
    return null;
  }

  async function run(label: string, action: () => Promise<void>) {
    setBusy(label);
    setError('');
    setNotice('');
    try {
      await action();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setBusy('');
    }
  }

  function requestPairing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const brief = validBrief();
    if (!brief) return;
    void run('Checking Chrome connection…', async () => {
      const host = new URL(brief.destination).hostname;
      const identity = JSON.stringify([brief.offer, brief.destination]);
      if (pair.current && pair.current.identity !== identity) {
        await contactExtension({ type: 'ROACLAW_DISCONNECT', workspaceId, sessionId: pair.current.sessionId });
        pair.current = null;
      }

      const sessionId = pair.current?.sessionId ?? crypto.randomUUID();
      pair.current = { sessionId, identity };
      writeDraft(draft, pair.current);
      const response = await contactExtension({
        type: 'ROACLAW_PAIR', workspaceId, sessionId, workspaceName: brief.offer, destinationHost: host,
      });
      if (response.status !== 'pending' && response.status !== 'paired') {
        throw new Error('Chrome returned an unexpected pairing status. Try again.');
      }
      setPairState(response.status);
      setDestination(brief.destination);
      setNotice(response.status === 'paired'
        ? 'Chrome is paired. Open the destination to capture the page.'
        : 'Open ROACLAW from the Chrome toolbar, approve the pairing, then select Check pairing.');
    });
  }

  function attachCapture() {
    const sessionId = pair.current?.sessionId;
    if (!sessionId) return;
    void run('Reading Chrome capture…', async () => {
      try {
        const response = await contactExtension({ type: 'ROACLAW_CAPTURE', workspaceId, sessionId });
        if (!response.capture) {
          setNotice('Capture the landing page in the Chrome side panel, then attach it here.');
          return;
        }
        resetEvidence();
        setCapture(response.capture);
        setNotice('Chrome capture attached. Review the visible evidence before running preflight.');
      } catch (failure) {
        setPairState('unpaired');
        setDestination('');
        resetEvidence();
        throw failure;
      }
    });
  }

  function runPreflight() {
    if (!capture) return;
    const brief = validBrief();
    if (!brief) return;
    setCopyNotice('');
    setNotice('');
    setReport(comparePreflight(brief, capture, inspection ?? capturedInspection, selectedPrice || undefined));
    window.requestAnimationFrame(() => document.getElementById('preflight-results')?.focus());
  }

  async function runDeviceInspection() {
    if (!capture || deviceBusy) return;
    const revision = captureRevision.current;
    setDeviceBusy(true);
    setDeviceNotice('Inspecting the capture on this device…');
    try {
      const verified = await inspectPreflight(capture).catch(() => capturedInspection);
      if (revision !== captureRevision.current) return;
      if (verified.source === 'captured') {
        setDeviceNotice('The on-device model was unavailable. Your results use the Chrome capture.');
        return;
      }
      const price = priceChoice.current?.value || undefined;
      setInspection(verified);
      setCopyNotice('');
      setReport((current) => current ? comparePreflight(current.brief, capture, verified, price) : null);
      setDeviceNotice('On-device inspection completed.');
    } finally {
      setDeviceBusy(false);
    }
  }

  function choosePrice(value: string) {
    setSelectedPrice(value);
    setCopyNotice('');
    setNotice('');
    if (report && capture) {
      setReport(comparePreflight(report.brief, capture, inspection ?? capturedInspection, value || undefined));
    }
  }

  function clearDraft() {
    void run('Clearing this draft…', async () => {
      const lastPair = pair.current;
      pair.current = null;
      setDraft({ ...emptyBrief });
      setErrors({});
      setPairState('unpaired');
      setDestination('');
      resetEvidence();
      try {
        sessionStorage.removeItem(storageKey);
      } catch {
        // In-memory values have already been cleared.
      }
      if (lastPair) {
        try {
          await contactExtension({ type: 'ROACLAW_DISCONNECT', workspaceId, sessionId: lastPair.sessionId });
        } catch {
          setNotice('Draft cleared. Check the ROACLAW side panel to disconnect any remaining Chrome pairing.');
          return;
        }
      }
      setNotice('Draft cleared.');
    });
  }

  async function copyLink() {
    if (!report?.correctedUrl) return;
    try {
      await navigator.clipboard.writeText(report.correctedUrl);
      setCopyNotice('Tracked link copied.');
    } catch {
      const range = document.createRange();
      if (correctedLink.current) {
        range.selectNodeContents(correctedLink.current);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
      }
      setCopyNotice('Select and copy the tracked link from the report.');
    }
  }

  const priceChoices = capture ? [...new Set(capture.visiblePriceText)] : [];
  const fieldProps = (name: keyof PreflightBrief) => ({
    name, value: draft[name], error: errors[name],
    onChange: (event: ChangeEvent<HTMLInputElement>) => edit(name, event.currentTarget.value),
  });

  return (
    <div className="preflight">
      <title>Campaign Preflight | ROACLAW</title>
      <a className="skip-link" href="#preflight-main">Skip to content</a>
      <header className="preflight-nav">
        <div className="preflight-shell preflight-nav-content">
          <Link className="brand preflight-brand" href="/">
            <span className="brand-mark" aria-hidden="true"><b /><b /><b /></span>
            <strong>ROACLAW</strong>
          </Link>
          <nav aria-label="Workspaces">
            <a href="/app/">Growth Audit</a>
            <span aria-current="page">Campaign Preflight</span>
          </nav>
        </div>
      </header>

      <main className="preflight-shell preflight-main" id="preflight-main">
        <div className="preflight-heading">
          <div>
            <h1>Campaign Preflight</h1>
            <p>Check the offer, call to action and tracking on your landing page before you send traffic.</p>
          </div>
          <button type="button" className="button preflight-clear" disabled={Boolean(busy)} onClick={clearDraft}>
            <Trash2 size={16} aria-hidden="true" /> Clear draft
          </button>
        </div>

        <div className="preflight-workspace">
          <form className="panel preflight-panel" id={formId} onSubmit={requestPairing} autoComplete="off" noValidate>
            <div className="preflight-panel-head">
              <h2>Campaign brief</h2>
              <p>Enter the values your audience should see.</p>
            </div>
            <fieldset className="preflight-fields" disabled={Boolean(busy)}>
              <legend className="preflight-sr-only">Offer and destination</legend>
              <Field {...fieldProps('offer')} label="Offer or product" placeholder="Everyday Essentials Set" required />
              <Field {...fieldProps('destination')} label="Destination URL" type="url" inputMode="url" autoCapitalize="none"
                spellCheck={false} placeholder="https://example.com/offer" required />
              <Field {...fieldProps('cta')} label="Expected call to action" placeholder="Shop the set" required />
              <div className="preflight-money">
                <Field {...fieldProps('amount')} label="Expected price (optional)" inputMode="decimal" placeholder="89.00" />
                <div className="field preflight-field">
                  <label htmlFor="preflight-currency">Currency</label>
                  <span className="select-control">
                    <select id="preflight-currency" name="currency" value={draft.currency}
                      onChange={(event) => edit('currency', event.currentTarget.value)}
                      aria-invalid={Boolean(errors.currency)} aria-describedby={errors.currency ? 'preflight-currency-error' : undefined}>
                      {preflightCurrencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
                    </select>
                    <ChevronDown size={14} aria-hidden="true" />
                  </span>
                  {errors.currency && <span id="preflight-currency-error" className="preflight-field-error">{errors.currency}</span>}
                </div>
              </div>
            </fieldset>
            <fieldset className="preflight-fields preflight-tracking" disabled={Boolean(busy)}>
              <legend>Tracking parameters (optional)</legend>
              {trackingFields.map((name) => (
                <Field key={name} {...fieldProps(name)} label={name} autoCapitalize="none" spellCheck={false} />
              ))}
            </fieldset>
          </form>

          <section className="panel preflight-panel" aria-labelledby="preflight-capture">
            <div className="preflight-panel-head preflight-capture-head">
              <div>
                <h2 id="preflight-capture">Landing page capture</h2>
                <p>Approve the page capture in the ROACLAW side panel.</p>
              </div>
              <span className={`preflight-connection preflight-connection--${pairState}`}>
                <span aria-hidden="true" />
                {pairState === 'paired' ? 'Chrome paired' : pairState === 'pending' ? 'Approval pending' : 'Chrome unpaired'}
              </span>
            </div>

            <div className="preflight-capture-body">
              {pairState !== 'paired' ? (
                <>
                  <p>{pairState === 'pending'
                    ? <>Open the ROACLAW side panel from the Chrome toolbar and select <strong>Connect Preflight</strong>. Then check the connection here.</>
                    : 'Enter your brief and request a connection while this tab is active.'}</p>
                  <div className="preflight-controls">
                    <button className="button primary" form={formId} type="submit" disabled={Boolean(busy)}>
                      <Link2 size={16} aria-hidden="true" /> {pairState === 'pending' ? 'Check pairing' : 'Request Chrome pairing'}
                    </button>
                    {pairState === 'unpaired' && <Link className="text-link" href="/#chrome">Install the Chrome companion</Link>}
                  </div>
                </>
              ) : (
                <>
                  <p>Open the destination in a new tab. Click the ROACLAW toolbar icon on that tab, then select <strong>Capture page evidence</strong>. Return here to attach it.</p>
                  <div className="preflight-controls">
                    <a className="button" id="preflight-destination-link" href={destination} target="_blank" rel="noreferrer">
                      Open destination <ArrowUpRight size={16} aria-hidden="true" />
                    </a>
                    <button className={`button${capture ? '' : ' primary'}`} type="button" onClick={attachCapture} disabled={Boolean(busy)}>
                      <ScanLine size={16} aria-hidden="true" /> {capture ? 'Refresh capture' : 'Attach Chrome capture'}
                    </button>
                  </div>
                </>
              )}
            </div>

            {capture && (
              <div className="preflight-evidence">
                <div className="preflight-evidence-heading">
                  <h3>Captured evidence</h3>
                  <time dateTime={capture.capturedAt}>{formatTime(capture.capturedAt)}</time>
                </div>
                <dl>
                  <dt>Page</dt>
                  <dd>
                    {capture.title && <strong>{capture.title}</strong>}
                    <code>{capture.url}</code>
                  </dd>
                  <dt>Headings</dt>
                  <dd>{capture.headings.join(' · ') || 'None captured'}</dd>
                  <dt>Calls to action</dt>
                  <dd>{capture.ctas.join(' · ') || 'None captured'}</dd>
                  <dt>Visible prices</dt>
                  <dd>{priceChoices.join(' · ') || 'None captured'}</dd>
                </dl>
                {priceChoices.length > 1 && (
                  <div className="field preflight-field preflight-price-selector">
                    <label htmlFor="preflight-price">Price to compare</label>
                    <span className="select-control">
                      <select id="preflight-price" ref={priceChoice} value={selectedPrice} disabled={Boolean(busy)} onChange={(event) => choosePrice(event.currentTarget.value)}>
                        <option value="">Choose captured price</option>
                        {priceChoices.map((price) => <option key={price} value={price}>{price}</option>)}
                      </select>
                      <ChevronDown size={14} aria-hidden="true" />
                    </span>
                  </div>
                )}
                <div className="preflight-controls">
                  <button className="button primary" type="button" onClick={runPreflight} disabled={Boolean(busy)}>
                    <ClipboardCheck size={16} aria-hidden="true" /> Run preflight
                  </button>
                </div>
              </div>
            )}

            <div className="preflight-local">
              <ShieldCheck size={17} aria-hidden="true" />
              <p>Your draft stays in this tab. Checks use the approved capture. Optional model inspection runs on this device.</p>
            </div>
            <div className="preflight-notices">
              <div role="status" aria-atomic="true">{busy || notice}</div>
              {error && <div role="alert"><CircleAlert size={16} aria-hidden="true" />{error}</div>}
            </div>
          </section>
        </div>

        {report && (
          <section className="panel preflight-report" aria-labelledby="preflight-results">
            <header className="preflight-panel-head preflight-report-head">
              <div>
                <h2 id="preflight-results" tabIndex={-1}>Preflight results</h2>
                <p>{report.source === 'on_device' ? 'On-device inspection via Firebase AI Logic' : 'Direct checks on Chrome capture'}</p>
              </div>
              <CheckStatus status={report.result} summary />
            </header>
            <div className="preflight-checked">
              <span>Checked <time dateTime={report.checkedAt}>{formatTime(report.checkedAt)}</time></span>
            </div>
            <table className="preflight-comparison" aria-label="Campaign brief and landing page comparison">
              <thead>
                <tr><th scope="col">Check</th><th scope="col">Expected</th><th scope="col">Observed</th></tr>
              </thead>
              <tbody>
                {report.rows.map((row) => (
                  <tr key={row.id}>
                    <th scope="row"><strong>{row.label}</strong><CheckStatus status={row.status} /></th>
                    <td>{row.expected}</td>
                    <td>{row.observed}<small>{row.detail}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {report.correctedUrl && (
              <div className="preflight-exports">
                <div>
                  <h3>Corrected tracked link</h3>
                  <code ref={correctedLink}>{report.correctedUrl}</code>
                  <p className="preflight-copy-notice" role="status">{copyNotice}</p>
                </div>
                <button className="button" type="button" onClick={copyLink}><Copy size={16} aria-hidden="true" /> Copy tracked link</button>
              </div>
            )}
            <div className="preflight-report-footer">
              <button className="button" type="button" onClick={() => downloadReport(report)}>
                <Download size={16} aria-hidden="true" /> Download HTML report
              </button>
              {report.source === 'captured' && (
                <button className="button" type="button" onClick={runDeviceInspection} disabled={Boolean(busy) || deviceBusy}>
                  <Cpu size={16} aria-hidden="true" /> Inspect on device
                </button>
              )}
              <p className="preflight-device-notice" role="status">{deviceNotice}</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
