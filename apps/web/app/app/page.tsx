'use client';

import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bookmark, CalendarClock, Check,
  ChevronDown, ClipboardList, Database, Globe, LayoutDashboard, Link2,
  ListChecks, LockKeyhole, ScanLine, ShieldCheck, Users, X,
} from 'lucide-react';
import Link from 'next/link';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import {
  analyzeAudit, fixtureSnapshot, workspaces,
  type AuditResult, type PageSnapshot, type PrivacyMode, type Workspace,
} from '../../lib/audit';
import { browserSession, clearBrowserSessions, contactExtension, type ExtensionReceipt } from '../../lib/bridge';
import { inspectPage, reasonFromFindings } from '../../lib/inference';
import { auth, openDemoSession, readWorkspace, updateWorkspace } from '../../lib/store';

type View = 'Overview' | 'Growth Audit' | 'Campaigns' | 'Clients' | 'Agent' | 'Memory' | 'Automations' | 'Settings';
type FollowUp = { id: string; runAt: string; status: 'scheduled' | 'completed'; description: string; result?: string };
type ResearchItem = ExtensionReceipt;
type ResearchNote = { id: string; text: string; tag: string; createdAt: string };
type WorkspaceData = { audits: AuditResult[]; research: ResearchItem[]; followups: FollowUp[]; notes?: ResearchNote[]; privacy: PrivacyMode; updatedAt?: string };

const initial: WorkspaceData = { audits: [], research: [], followups: [], privacy: 'hybrid' };
const navigation = [
  { name: 'Overview', icon: LayoutDashboard }, { name: 'Growth Audit', icon: ScanLine },
  { name: 'Campaigns', icon: Activity }, { name: 'Clients', icon: Users },
  { name: 'Agent', icon: ListChecks }, { name: 'Memory', icon: Bookmark },
  { name: 'Automations', icon: CalendarClock }, { name: 'Settings', icon: ShieldCheck },
] as const;

const runLabel = { local: 'Device only', hybrid: 'Prefer device', cloud: 'Cloud only' };
const maximum = 30;
const actionLabels = {
  pending: 'Awaiting Chrome review', approved: 'Ready to save in Chrome', declined: 'Declined',
  expired: 'Review expired', verification_failed: 'Chrome could not verify', executed: 'Verified in Chrome',
};
const showcase = [
  { id: 'sable-stem', name: 'Ecommerce', detail: 'Compare an advertised price with the product page and review a tracking link.' },
  { id: 'morrow-dental', name: 'Lead generation', detail: 'Check whether the landing-page button helps visitors book an appointment.' },
  { id: 'northline-retail', name: 'Agency', detail: 'Review a retail client’s metrics and switch between isolated client records.' },
] as const;
const initials = { 'sable-stem': 'SS', 'northline-retail': 'NR', 'morrow-dental': 'MD' } as Record<string, string>;

function friendly(error: unknown) {
  if (error instanceof Error && 'code' in error) {
    if (error.code === 'api-not-enabled') return 'Chrome’s local model is unavailable. Device-only mode kept the page on this device.';
    if (error.code === 'permission-denied') return 'Firebase rejected access to this workspace. Reopen the demo session and try again.';
    return 'The request failed (' + String(error.code).slice(0, 70) + '). Try again.';
  }
  return error instanceof Error ? error.message : 'The request could not be completed.';
}

function dateTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: timezone }).format(new Date(value));
}

function workspaceMetrics(workspace: Workspace) {
  const metrics = workspace.metricSnapshot;
  const money = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: workspace.currency, maximumFractionDigits: 0 }).format(amount);
  const items = [{ name: 'Spend', value: money(metrics.spend), detail: workspace.currency }];
  if (metrics.purchases !== undefined) items.push({ name: 'Purchases', value: String(metrics.purchases), detail: 'Attributed orders' });
  if (metrics.attributedRevenue !== undefined) {
    items.push({ name: 'Revenue', value: money(metrics.attributedRevenue), detail: workspace.currency });
    items.push({ name: 'Observed ROAS', value: (metrics.attributedRevenue / metrics.spend).toFixed(3) + '×', detail: workspace.objective ? 'Goal ' + workspace.objective.target + '×' : 'Revenue / spend' });
  }
  if (metrics.leads !== undefined) items.push({ name: 'Leads', value: String(metrics.leads), detail: 'Fixture records' });
  if (metrics.bookings !== undefined) items.push({ name: 'Bookings', value: String(metrics.bookings), detail: 'Fixture records' });
  return items;
}

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [setup, setSetup] = useState(false);
  const [view, setView] = useState<View>('Growth Audit');
  const [workspace, setWorkspace] = useState(workspaces[0]);
  const [workspaceData, setWorkspaceData] = useState(initial);
  const [loadedScope, setLoadedScope] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [capture, setCapture] = useState<PageSnapshot | null>(null);
  const [currentAudit, setCurrentAudit] = useState<AuditResult | null>(null);
  const [bookmarkState, setBookmarkState] = useState<string>('unrequested');
  const [showCapture, setShowCapture] = useState(false);
  const [search, setSearch] = useState('');
  const [note, setNote] = useState('');
  const [noteTag, setNoteTag] = useState('Tracking');
  const [timing, setTiming] = useState('tomorrow');
  const [pair, setPair] = useState('unpaired');
  const [mobileNav, setMobileNav] = useState(false);
  const [command, setCommand] = useState('');
  const [agentReply, setAgentReply] = useState('');
  const dataRef = useRef(workspaceData);
  const currentWorkspace = useRef(workspace.id);
  const uid = user?.uid;
  const scope = uid ? uid + '/' + workspace.id : null;
  const ready = scope !== null && loadedScope === scope;

  useEffect(() => onAuthStateChanged(auth, (session) => {
    setUser(session);
    setAuthReady(true);
  }), []);
  useEffect(() => {
    let cancelled = false;
    currentWorkspace.current = workspace.id;
    setCurrentAudit(null);
    setCapture(null);
    setShowCapture(false);
    setBookmarkState('unrequested');
    setPair('unpaired');
    setLoadedScope(null);
    setError(null);
    setNotice(null);
    setAgentReply('');
    setSearch('');
    setNote('');
    dataRef.current = initial;
    setWorkspaceData(initial);
    if (!uid) return;
    readWorkspace<WorkspaceData>(uid, workspace.id).then((stored) => {
      if (!cancelled) {
        dataRef.current = stored ?? initial;
        setWorkspaceData(dataRef.current);
        setCurrentAudit(dataRef.current.audits[0] ?? null);
        setLoadedScope(scope);
      }
    }).catch((problem: unknown) => { if (!cancelled) setError(friendly(problem)); });
    return () => { cancelled = true; };
  }, [uid, scope, workspace.id]);

  async function doWork(label: string, task: () => Promise<void>) {
    setBusy(label);
    setError(null);
    setNotice(null);
    try { await task(); } catch (problem) { setError(friendly(problem)); } finally { setBusy(null); }
  }

  async function persist(change: (current: WorkspaceData) => Partial<WorkspaceData>) {
    if (!user || !ready) throw new Error('Open your demo workspace first.');
    const updatedAt = new Date().toISOString();
    const current = await updateWorkspace<WorkspaceData>(user.uid, workspace.id, (stored) => {
      const previous = stored ?? initial;
      return { ...previous, ...change(previous), updatedAt };
    });
    if (auth.currentUser?.uid === user.uid && currentWorkspace.current === workspace.id) {
      dataRef.current = current;
      setWorkspaceData(current);
    }
    return current;
  }

  function setClient(id: string) {
    const found = workspaces.find((entry) => entry.id === id);
    if (found) setWorkspace(found);
  }

  function common() {
    if (!user) throw new Error('Open your demo workspace first.');
    return { workspaceId: workspace.id, sessionId: browserSession(user.uid, workspace.id) };
  }

  function startDemo(id: string) {
    return doWork('Opening demo workspace', async () => {
      setClient(id);
      await openDemoSession();
      setSetup(false);
    });
  }

  function closeDemo() {
    return doWork('Closing demo session', async () => {
      if (user) {
        await Promise.allSettled(workspaces.map(({ id }) => contactExtension({
          type: 'ROACLAW_DISCONNECT', workspaceId: id, sessionId: browserSession(user.uid, id),
        })));
      }
      clearBrowserSessions();
      await signOut(auth);
      setSetup(false);
      setView('Growth Audit');
    });
  }

  function pairExtension() {
    return doWork('Contacting the extension', async () => {
      const response = await contactExtension({ type: 'ROACLAW_PAIR', ...common(), workspaceName: workspace.name });
      setPair(response.status);
      setNotice(response.status === 'paired'
        ? 'This tab is paired with the Chrome extension.'
        : 'Open the ROACLAW side panel, confirm this workspace, then check pairing again here.');
    });
  }

  function getCapture() {
    return doWork('Reading the approved capture', async () => {
      const response = await contactExtension({ type: 'ROACLAW_CAPTURE', ...common() });
      if (!response.capture) throw new Error('Choose Capture page evidence in the Chrome side panel first.');
      const { visiblePriceText, ...snapshot } = response.capture;
      const location = new URL(snapshot.url);
      setCapture({ ...snapshot, prices: visiblePriceText, isSynthetic: location.origin === window.location.origin && location.pathname === workspace.pagePath });
      setCurrentAudit(null);
      setBookmarkState('unrequested');
      setNotice('Approved Chrome capture attached.');
    });
  }

  function runAudit() {
    return doWork('Inspecting page evidence', async () => {
      const page = capture ?? fixtureSnapshot(workspace, window.location.origin);
      if (!page.headings.length && !page.prices.length && !page.ctas.length) {
        throw new Error('This workspace needs a page capture. Attach an approved Chrome capture or choose Sable & Stem.');
      }
      const privacy = page.isSynthetic ? workspaceData.privacy : 'local';
      const extracted = await inspectPage(page, privacy);
      let result = analyzeAudit(workspace, page, extracted.fields, extracted.source);
      if (privacy !== 'local' && result.findings.length) {
        setBusy('Reviewing findings in the cloud');
        try {
          const commentary = await reasonFromFindings(result.findings);
          result = { ...result, commentary, reasoningSource: 'in_cloud' };
        } catch {
          setNotice('Page inspection finished. The cloud review was unavailable.');
        }
      }
      setCurrentAudit(result);
      setBookmarkState('unrequested');
      if (page.isSynthetic) await persist((stored) => ({ audits: [result, ...stored.audits].slice(0, maximum) }));
    });
  }

  function sendBookmark() {
    return doWork('Sending to Chrome for review', async () => {
      if (!currentAudit?.proposal) throw new Error('Run an audit with a proposed destination first.');
      const { id, title, url } = currentAudit.proposal;
      const response = await contactExtension({ type: 'ROACLAW_PROPOSE_BOOKMARK', ...common(), proposal: { id, title, url } });
      await recordAction(response.status, response.receipt);
      setNotice(response.receipt ? 'Chrome already verified this bookmark.' : 'Review the bookmark destination in the Chrome side panel.');
    });
  }

  async function recordAction(status: string, receipt?: ExtensionReceipt) {
    const audit = currentAudit;
    if (!audit?.proposal) return;
    if (status === 'empty' && audit.action) status = 'expired';
    setBookmarkState(status);
    if (!Object.hasOwn(actionLabels, status) || (status === 'executed' && !receipt)) return;
    if (receipt && (receipt.workspaceId !== workspace.id || receipt.proposalId !== audit.proposal.id)) {
      throw new Error('Chrome returned a receipt for a different workspace or request.');
    }
    const updated = { ...audit, action: { status: status as keyof typeof actionLabels, updatedAt: new Date().toISOString() } };
    setCurrentAudit(updated);
    if (!audit.page.isSynthetic) return;
    await persist((stored) => ({
      audits: stored.audits.map((entry) => entry.id === audit.id ? { ...entry, action: updated.action } : entry),
      research: receipt && !stored.research.some((entry) => entry.proposalId === receipt.proposalId)
        ? [receipt, ...stored.research].slice(0, maximum)
        : stored.research,
    }));
  }

  function checkReceipt() {
    return doWork('Checking Chrome’s receipt', async () => {
      const proposalId = currentAudit?.proposal?.id;
      if (!proposalId) return;
      const response = await contactExtension({ type: 'ROACLAW_RECEIPT', ...common(), proposalId });
      await recordAction(response.status, response.receipt);
      if (response.receipt) {
        setNotice('Chrome saved and verified the bookmark in ' + response.receipt.folder + '.');
      } else {
        setNotice(response.status === 'declined' ? 'The bookmark was declined.' : 'Chrome has not returned a verified bookmark receipt.');
      }
    });
  }

  function schedule() {
    return doWork('Saving the follow-up', async () => {
      if (workspace.id !== 'sable-stem' || !currentAudit?.page.isSynthetic) throw new Error('Finish the Sable & Stem demo audit to schedule a fixture check.');
      const when = new Date(Date.now() + (timing === 'minute' ? 60_000 : 24 * 60 * 60_000)).toISOString();
      const followUp: FollowUp = { id: crypto.randomUUID(), runAt: when, status: 'scheduled', description: 'Recheck the Sable & Stem landing-page price' };
      await persist((stored) => ({ followups: [followUp, ...stored.followups].slice(0, maximum) }));
      setNotice('Follow-up saved for ' + dateTime(when, workspace.timezone) + '.');
    });
  }

  function runDueChecks() {
    return doWork('Checking due follow-ups', async () => {
      const due = dataRef.current.followups.filter((item) => item.status === 'scheduled' && Date.parse(item.runAt) <= Date.now());
      if (!due.length) { setNotice('No follow-ups are due.'); return; }
      const page = await fetch('/demo-store/', { cache: 'no-store' });
      if (!page.ok) throw new Error('The demo storefront was unavailable. The checks are still scheduled.');
      const document = new DOMParser().parseFromString(await page.text(), 'text/html');
      const price = document.querySelector('.fixture-price')?.textContent?.trim();
      if (!price) throw new Error('The storefront did not expose a price. The checks are still scheduled.');
      const checkIds = new Set(due.map((item) => item.id));
      await persist((stored) => ({ followups: stored.followups.map((item) => checkIds.has(item.id) && item.status === 'scheduled'
        ? { ...item, status: 'completed' as const, result: 'The fixture storefront displays ' + price + '.' }
        : item) }));
      setNotice(due.length + ' due ' + (due.length === 1 ? 'check completed.' : 'checks completed.'));
    });
  }

  function saveNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = note.trim();
    if (!text || text.length > 280) return;
    return doWork('Saving research note', async () => {
      const entry = { id: crypto.randomUUID(), text, tag: noteTag, createdAt: new Date().toISOString() };
      await persist((stored) => ({ notes: [entry, ...(stored.notes ?? [])].slice(0, maximum) }));
      setNote('');
      setNotice('Research note saved.');
    });
  }

  function exportAudit() {
    if (!currentAudit?.page.isSynthetic) return;
    const report = new Blob([JSON.stringify(currentAudit, null, 2)], { type: 'application/json' });
    const download = URL.createObjectURL(report);
    const link = document.createElement('a');
    link.href = download;
    link.download = 'roaclaw-' + workspace.id + '-audit.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(download), 1000);
  }

  function reviewCommand(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!command.trim()) return;
    const query = command.toLowerCase();
    if (/(audit|offer|price|campaign|utm)/.test(query) && currentAudit) {
      setAgentReply(currentAudit.findings.map((item) => item.title).join(' · ') || 'The current audit found no supported discrepancy.');
    } else if (/(bookmark|research|saved)/.test(query)) {
      const item = dataRef.current.research[0];
      setAgentReply(item ? 'Latest verified bookmark: ' + item.title + ' · ' + item.folder : 'No bookmark receipts in this workspace.');
    } else {
      setAgentReply('Ask for findings from an audit, or for the latest verified bookmark in this workspace.');
    }
  }

  const switchView = (selected: View) => { setView(selected); setMobileNav(false); setNotice(null); setError(null); };
  const metrics = workspaceMetrics(workspace);
  const query = search.toLowerCase();
  const researchMatches = workspaceData.research.filter((entry) => (entry.title + ' ' + entry.url).toLowerCase().includes(query));
  const noteMatches = (workspaceData.notes ?? []).filter((entry) => (entry.text + ' ' + entry.tag).toLowerCase().includes(query));
  const receipt = workspaceData.research.find((entry) => entry.proposalId === currentAudit?.proposal?.id);
  const recent = workspaceData.audits[0];
  const priceComparison = currentAudit?.priceComparison;
  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: workspace.currency, maximumFractionDigits: 2 });
  const bundledPageTitle = workspace.selectedProductPage?.title ?? (workspace.landingPage ? 'Booking page fixture' : null);
  const activePageTitle = capture?.title ?? bundledPageTitle ?? 'No page attached';
  const pageAttached = Boolean(capture || bundledPageTitle);
  const externalCapture = Boolean(capture && !capture.isSynthetic);

  return (
    <div className="workbench">
      <a className="skip-link" href="#main">Skip to main content</a>
      <aside className={'sidebar' + (mobileNav ? ' expanded' : '')} aria-label="Workspace navigation">
        <Link className="brand brand-home" href="/" aria-label="ROACLAW home"><i className="brand-mark" aria-hidden="true"><b /><b /><b /></i><strong>ROACLAW</strong></Link>
        <button className="mobile-toggle button" onClick={() => setMobileNav(!mobileNav)} aria-expanded={mobileNav}>{mobileNav ? 'Close menu' : 'Menu'}</button>
        <div className="sidebar-body">
          <label className="workspace-select">
            <span className="avatar">{initials[workspace.id]}</span>
            <span><small>Workspace</small><strong>{workspace.name}</strong></span>
            <ChevronDown size={15} aria-hidden="true" />
            <select aria-label="Workspace" value={workspace.id} disabled={Boolean(busy)} onChange={(event) => setClient(event.target.value)}>
              {workspaces.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
            </select>
          </label>
          <nav>
            <ul>{navigation.map(({ name, icon: Icon }) => <li key={name}>
              <button className={view === name ? 'nav-item active' : 'nav-item'} aria-current={view === name ? 'page' : undefined} onClick={() => switchView(name)}>
                <Icon size={18} strokeWidth={1.65} aria-hidden="true" />{name}
              </button>
            </li>)}</ul>
          </nav>
          <div className="sidebar-foot"><span className="dot" /><div><strong>Demo data</strong><small>No live ad account</small></div></div>
        </div>
      </aside>
      <div className="canvas">
        <header className="topbar">
          <div className="breadcrumb"><span>{workspace.name}</span><span aria-hidden="true">/</span><strong>{view}</strong></div>
          {user && ready ? <span className="session-state" data-testid="demo-ready"><ShieldCheck size={15} /> Demo session active</span> : <span className="session-state"><ShieldCheck size={15} /> Demo workspace</span>}
        </header>
        <main className="main" id="main">
          <div className="page-head">
            <div><h1>{view}</h1>{view === 'Growth Audit' && <p>Check that the landing page matches the ad.</p>}</div>
            {!user && !setup && <button className="button primary" disabled={!authReady || Boolean(busy)} onClick={() => setSetup(true)}>Open demo <ArrowRight size={17} aria-hidden="true" /></button>}
            {user && view === 'Overview' && <button className="button primary" onClick={() => switchView('Growth Audit')}>New audit <ArrowRight size={17} /></button>}
          </div>
          <div className="feedback" aria-live="polite">
            {busy && <p role="status"><span className="pulse" />{busy}…</p>}
            {error && <p className="error" role="alert">{error}</p>}
            {notice && <p className="notice">{notice}</p>}
          </div>
          {setup && !user && <section className="panel setup-panel" aria-labelledby="setup-title">
            <header className="section-bar"><h2 id="setup-title">Choose a demo workspace</h2><button type="button" className="text-link" onClick={() => setSetup(false)}>Back to preview</button></header>
            <ul>{showcase.map((entry) => <li key={entry.id}>
              <div><h3>{entry.name}</h3><p>{entry.detail}</p></div>
              <button type="button" className="button" disabled={Boolean(busy)} onClick={() => void startDemo(entry.id)}>Open {entry.name.toLowerCase()} demo <ArrowRight size={15} aria-hidden="true" /></button>
            </li>)}</ul>
          </section>}
          {view !== 'Settings' && view !== 'Clients' && <div className="data-band"><span><Database size={15} aria-hidden="true"/> Synthetic campaign data</span><span>{workspace.metricSnapshot.period.replace('/', ' – ')} <span aria-hidden="true">·</span> {workspace.timezone}</span></div>}
          {(view === 'Overview' || view === 'Growth Audit') && <div className="metric-strip" aria-label="Workspace metrics">
            {metrics.map((item) => <div className="metric" key={item.name}><span>{item.name}</span><strong>{item.value}</strong><small>{item.detail}</small></div>)}
          </div>}
          {view === 'Overview' && <section className="panel brief">
            <h2>{workspace.name}</h2>
            <ul className="simple-list">
              <li><span>Audits saved to this demo workspace</span><strong>{workspaceData.audits.length}</strong></li>
              <li><span>Verified Chrome bookmarks</span><strong>{workspaceData.research.length}</strong></li>
              <li><span>Scheduled follow-ups</span><strong>{workspaceData.followups.filter((item) => item.status === 'scheduled').length}</strong></li>
            </ul>
            {recent && <button className="button" onClick={() => { setCurrentAudit(recent); switchView('Growth Audit'); }}>Open latest audit <ArrowUpRight size={16} /></button>}
          </section>}

          {view === 'Growth Audit' && <>
            <section className="panel audit-input" aria-labelledby="input-title">
              <div className="input-main">
                <div className="input-detail">
                  <h2 id="input-title">Page to inspect</h2>
                  <div className="source-row">
                    <span className="source-icon"><Globe size={18} aria-hidden="true" /></span>
                    <div><strong>{activePageTitle}</strong>{pageAttached && <small>{capture ? 'Approved Chrome capture' : 'Demo page'}</small>}</div>
                    {!capture && bundledPageTitle && <Link href={workspace.pagePath} target="_blank" className="icon-link" aria-label="Open demo storefront in a new tab"><ArrowUpRight size={17} /></Link>}
                  </div>
                </div>
                <div className="input-run">
                  <div className="audit-controls">
                    <label className="field">
                      <span>Inference mode</span>
                      <span className="select-control">
                        <select value={externalCapture ? 'local' : workspaceData.privacy} disabled={!ready || Boolean(busy) || externalCapture} onChange={(event) => {
                          const privacy = event.target.value as PrivacyMode;
                          void doWork('Saving inference mode', async () => { await persist(() => ({ privacy })); });
                        }}>{Object.entries(runLabel).map(([mode, label]) => <option key={mode} value={mode}>{label}</option>)}</select>
                        <ChevronDown size={16} aria-hidden="true" />
                      </span>
                    </label>
                    <button className="button primary" disabled={!ready || Boolean(busy) || !pageAttached} onClick={() => void runAudit()}>{currentAudit ? 'Run again' : 'Run Growth Audit'} <ArrowRight size={17} aria-hidden="true" /></button>
                  </div>
                  <p className="field-help">{externalCapture ? 'Pages outside the demo use device-only analysis.' : workspaceData.privacy === 'local' ? 'Chrome reads the page on this device. Cloud review is off.' : 'Cloud inference can receive page headings, prices, and button labels.'}</p>
                </div>
              </div>
              <div className="capture-box">
                <button className="text-link" aria-expanded={showCapture} onClick={() => setShowCapture(!showCapture)}><Link2 size={16} aria-hidden="true" /> {showCapture ? 'Hide Chrome capture options' : 'Use an approved Chrome capture'}</button>
                {showCapture && <div className="capture-actions">
                  <p>Pair this tab. Open the page you want and approve the capture in the ROACLAW side panel.</p>
                  <button className="button" disabled={!ready || Boolean(busy)} onClick={() => void pairExtension()}>{pair === 'pending' ? 'Check pairing' : pair === 'paired' ? 'Confirm pairing' : 'Pair Chrome extension'}</button>
                  <button className="button" disabled={!ready || Boolean(busy)} onClick={() => void getCapture()}>Get approved capture</button>
                  {capture && <button className="text-link" onClick={() => { setCapture(null); setCurrentAudit(null); }}>Use demo storefront</button>}
                  <a className="text-link" href="/roaclaw-extension.zip" download>Download Chrome extension <ArrowDownRight size={15} aria-hidden="true" /></a>
                </div>}
              </div>
            </section>

            <div className="audit-grid">
              <section className="panel evidence-panel" aria-labelledby="evidence-title">
                <header className="section-bar">
                  <h2 id="evidence-title">Audit findings</h2>
                  {currentAudit && <div className="source-status">
                    <span className="flag"><ScanLine size={13} aria-hidden="true" />Page · {currentAudit.pageSource === 'on_device' ? 'On device' : 'In cloud'}</span>
                    {currentAudit.reasoningSource && <span className="flag"><Activity size={13} aria-hidden="true" />Review · In cloud</span>}
                  </div>}
                </header>
                {currentAudit ? <>
                  {priceComparison && <div className="offer-compare" aria-label="Verified price comparison">
                    <div><span>Campaign price</span><strong>{currency.format(priceComparison.campaign)}</strong></div>
                    <div><span>Landing page price</span><strong>{currency.format(priceComparison.page)}</strong></div>
                  </div>}
                  <ul className="findings">{currentAudit.findings.map((finding) => <li key={finding.id}>
                    <span className={'severity ' + finding.severity}>{finding.type === 'unknown' ? 'Unverified' : finding.type === 'hypothesis' ? 'Hypothesis' : finding.severity + ' priority'}</span>
                    <div><h3>{finding.title}</h3><p>{finding.explanation}</p><blockquote>{finding.evidence}</blockquote></div>
                  </li>)}</ul>
                  {!currentAudit.findings.length && <p className="empty-state">The page evidence supports no discrepancies.</p>}
                  {currentAudit.commentary && <div className="interpretation"><strong>Cloud review</strong><p>{currentAudit.commentary}</p></div>}
                  {currentAudit.page.isSynthetic && <div className="export-row"><button type="button" className="text-link" onClick={exportAudit}><ArrowDownRight size={15} aria-hidden="true" /> Export audit JSON</button></div>}
                </> : <div className="empty-state"><ScanLine size={26} strokeWidth={1.5} aria-hidden="true" /><p>{user ? 'Run the audit to check price, tracking, and campaign performance.' : 'Open a demo session to run your first audit.'}</p></div>}
              </section>
              <aside className="audit-rail" aria-label="Bookmark approval and audit history">
                <section className="panel action-panel">
                  <header className="section-bar"><h2>Chrome bookmark</h2><ClipboardList size={18} aria-hidden="true" /></header>
                  {currentAudit?.proposal ? <>
                    <h3>{receipt ? 'Bookmark verified' : 'Save a tagged URL'}</h3>
                    <p>{receipt ? 'Chrome confirmed the saved title and destination.' : 'Check the destination in the side panel before saving it.'}</p>
                    {currentAudit.action && !receipt && <p className="action-state" role="status">{actionLabels[currentAudit.action.status]}</p>}
                    <dl className="diff">
                      <dt>Current destination</dt><dd>{currentAudit.proposal.before}</dd>
                      <dt>With campaign tag</dt><dd>{currentAudit.proposal.url}</dd>
                    </dl>
                    {receipt ? <p className="receipt"><Check size={16} aria-hidden="true" /> {receipt.folder} · {dateTime(receipt.verifiedAt, workspace.timezone)}</p> : <>
                      {pair !== 'paired' && !showCapture && <button className="button" disabled={Boolean(busy)} onClick={() => void pairExtension()}>{pair === 'pending' ? 'Check pairing' : 'Pair Chrome extension'}</button>}
                      <div className="rail-actions"><button className="button primary" disabled={Boolean(busy) || pair !== 'paired'} onClick={() => void sendBookmark()}>Send for Chrome approval</button>
                        {(bookmarkState !== 'unrequested' || currentAudit.action) && <button className="button" disabled={Boolean(busy)} onClick={() => void checkReceipt()}>Check receipt</button>}</div>
                    </>}
                  </> : <p className="action-empty">When a campaign tag is missing, the audit prepares a link you can review and bookmark.</p>}
                </section>
                <section className="panel log-panel">
                  <header className="section-bar"><h2>Audit history</h2><Activity size={18} aria-hidden="true" /></header>
                  {!workspaceData.audits.length ? <p className="action-empty">No saved audits yet.</p> : <ul>
                    {workspaceData.audits.slice(0, 3).map((audit) => <li key={audit.id}><button className="text-link" onClick={() => setCurrentAudit(audit)}>{audit.page.title}<ArrowUpRight size={14} aria-hidden="true" /></button><small>{dateTime(audit.createdAt, workspace.timezone)}{audit.action && ' · ' + actionLabels[audit.action.status]}</small></li>)}
                  </ul>}
                </section>
              </aside>
            </div>
          </>}

          {view === 'Campaigns' && <section className="panel table-panel"><h2>Campaign record</h2>
            {workspace.campaign ? <dl className="detail-list">
              <div><dt>Campaign</dt><dd>{workspace.campaign.title}</dd></div>
              <div><dt>Advertised product</dt><dd>{workspace.campaign.advertisedProduct}</dd></div>
              <div><dt>Advertised price</dt><dd>${workspace.campaign.advertisedPrice}</dd></div>
              <div><dt>Destination</dt><dd><Link className="text-link" href={workspace.campaign.destination}>{workspace.campaign.destination} <ArrowUpRight size={15} /></Link></dd></div>
            </dl> : <dl className="detail-list">
                <div><dt>Campaign goal</dt><dd>{workspace.landingPage?.campaignGoal ?? 'No goal set'}</dd></div>
                <div><dt>Page button</dt><dd>{workspace.landingPage?.visibleCTA ?? 'No page attached'}</dd></div>
                <div><dt>Destination</dt><dd><Link className="text-link" href={workspace.pagePath}>Open demo page <ArrowUpRight size={15} aria-hidden="true" /></Link></dd></div>
              </dl>}
          </section>}
          {view === 'Clients' && <section className="panel table-panel"><h2>Demo clients</h2><ul className="simple-list">
            {workspaces.map((entry) => <li key={entry.id}><span>{entry.name}<small> {entry.category.replace('_', ' ')}</small></span><button className="button" disabled={Boolean(busy) || workspace.id === entry.id} onClick={() => setClient(entry.id)}>{workspace.id === entry.id ? 'Current workspace' : 'Open workspace'}</button></li>)}
          </ul></section>}
          {view === 'Agent' && <section className="panel table-panel">
            <h2>Look up a workspace record</h2><p>Find the current audit findings or the latest verified bookmark.</p>
            <form className="command-form" onSubmit={reviewCommand}><label className="field grow"><span>Question</span><input value={command} onChange={(event) => setCommand(event.target.value)} required maxLength={180} placeholder="What did the latest audit find?" /></label><button className="button primary" type="submit">Find in workspace</button></form>
            {agentReply && <p className="interpretation" aria-live="polite">{agentReply}</p>}
            <button className="button" onClick={() => switchView('Growth Audit')}>Open audit findings</button>
            <button className="button quiet" onClick={() => switchView('Memory')}>Open saved bookmarks</button>
          </section>}
          {view === 'Memory' && <section className="panel table-panel">
            <h2>Verified research bookmarks</h2><label className="field"><span>Search bookmarks and notes</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
            <ul className="simple-list">{researchMatches.map((item) => <li key={item.proposalId}><a className="text-link" href={item.url} target="_blank" rel="noreferrer">{item.title} <ArrowUpRight size={15} aria-hidden="true" /></a><small>{dateTime(item.verifiedAt, workspace.timezone)}</small></li>)}</ul>
            {!researchMatches.length && <p>{search ? 'No bookmarks match this search.' : 'No Chrome bookmarks verified for this workspace yet.'}</p>}
            <section className="research-notes" aria-labelledby="notes-title">
              <h2 id="notes-title">Research notes</h2>
              <form className="command-form" onSubmit={saveNote}>
                <label className="field grow"><span>Note</span><input value={note} onChange={(event) => setNote(event.target.value)} required maxLength={280} placeholder="Record a finding from this demo" /></label>
                <label className="field"><span>Tag</span><span className="select-control"><select aria-label="Tag" value={noteTag} onChange={(event) => setNoteTag(event.target.value)}><option>Tracking</option><option>Offer</option><option>Follow-up</option></select><ChevronDown size={16} aria-hidden="true" /></span></label>
                <button className="button primary" type="submit" disabled={!ready || Boolean(busy)}>Save note</button>
              </form>
              <ul className="simple-list">{noteMatches.map((item) => <li key={item.id}><div><p>{item.text}</p><small>{dateTime(item.createdAt, workspace.timezone)}</small></div><span className="flag">{item.tag}</span></li>)}</ul>
              {!noteMatches.length && <p>{search ? 'No notes match this search.' : 'No saved notes yet.'}</p>}
            </section>
          </section>}
          {view === 'Automations' && <section className="panel table-panel">
            <h2>Follow-up checks</h2><p>Set a time to recheck the storefront price. Open this page when the check is due and run it here.</p>
            <div className="command-form">
              <label className="field">
                <span>Schedule</span>
                <span className="select-control">
                  <select value={timing} onChange={(event) => setTiming(event.target.value)}>
                    <option value="tomorrow">In 24 hours</option><option value="minute">In one minute</option>
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </span>
              </label>
              <button className="button primary" disabled={!ready || !currentAudit || workspace.id !== 'sable-stem' || Boolean(busy)} onClick={() => void schedule()}>Schedule follow-up</button>
              <button className="button" disabled={!ready || Boolean(busy)} onClick={() => void runDueChecks()}>Run due checks</button>
            </div>
            <ul className="simple-list">{workspaceData.followups.map((item) => <li key={item.id}><div><strong>{item.description}</strong><small>{dateTime(item.runAt, workspace.timezone)}</small>{item.result && <small>{item.result}</small>}</div><span className="flag ink">{item.status}</span></li>)}</ul>
            {!workspaceData.followups.length && <p>No follow-ups are scheduled for this workspace.</p>}
          </section>}
          {view === 'Settings' && <section className="panel table-panel">
            <header className="section-bar"><h2>Page capture and cloud access</h2><LockKeyhole size={18} aria-hidden="true" /></header>
            <p>Device-only mode keeps inference local. Synthetic audits and verified demo receipts are saved to your Firebase workspace. Pages outside the demo use device-only analysis and stay in the current tab.</p>
            <button className="button" onClick={() => switchView('Growth Audit')}>Manage inference mode in Growth Audit</button>
            {user && <button className="button quiet" disabled={Boolean(busy)} onClick={() => void closeDemo()}><X size={16} /> Close demo session</button>}
          </section>}
        </main>
      </div>
    </div>
  );
}
