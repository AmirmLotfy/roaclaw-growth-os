import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDownToLine, ArrowRight, ArrowUpRight, BookmarkCheck, PanelRight, ScanLine } from 'lucide-react';
import './site.css';

const source = 'https://github.com/AmirmLotfy/roaclaw-growth-os';
const extension = '/roaclaw-extension.zip';

export const metadata: Metadata = {
  title: 'ROACLAW | Check the ad against the page',
  description: 'Find the gap between your campaign and its landing page. Inspect the offer, verify tracking, and approve the exact follow-up in Chrome.',
};

function SiteBrand() {
  return <Link href="/" className="brand brand-home" aria-label="ROACLAW home">
    <span className="brand-mark" aria-hidden="true"><b /><b /><b /></span><strong>ROACLAW</strong>
  </Link>;
}

export default function Site() {
  return <div className="site">
    <a href="#product" className="skip-link">Skip to content</a>
    <header className="site-header">
      <div className="site-wrap site-nav">
        <SiteBrand />
        <nav aria-label="Product website"><ul>
          <li><a href="#workflow">How it works</a></li>
          <li><a href="#chrome">Chrome extension</a></li>
          <li><a href="#privacy">Privacy</a></li>
        </ul></nav>
        <Link href="/app/" className="button site-header-cta">Open app <ArrowUpRight size={17} aria-hidden="true" /></Link>
      </div>
    </header>

    <main id="product">
      <section className="site-hero">
        <div className="site-wrap hero-layout">
          <div className="hero-copy">
            <h1>Does the landing page match the ad?</h1>
            <p>Compare the advertised offer, landing page, and tracking in one audit. See the evidence before you change anything.</p>
            <div className="site-actions">
              <Link href="/app/" className="button primary">Open Growth Audit <ArrowRight size={17} aria-hidden="true" /></Link>
              <a href="#workflow" className="site-link">See how it works</a>
            </div>
          </div>
          <figure className="hero-demo">
            <Image src="/site/growth-audit.webp" width={1260} height={809}
              alt="ROACLAW Growth Audit showing a $99 campaign price, a $119 page price, and a tagged Chrome bookmark to review"
              sizes="(max-width: 880px) 95vw, 60vw" unoptimized priority />
            <figcaption>Growth Audit run on the Sable &amp; Stem demo</figcaption>
          </figure>
        </div>
      </section>

      <section className="site-wrap site-section workflow-section" id="workflow" aria-labelledby="workflow-heading">
        <div className="site-section-title">
          <h2 id="workflow-heading">Follow the evidence</h2>
          <p>Start with the demo campaign or attach a page you’ve approved in Chrome.</p>
        </div>
        <ol className="workflow-list">
          <li>
            <ScanLine size={24} aria-hidden="true" />
            <h3>Inspect the page</h3>
            <p>Capture visible headings, prices, and button labels. Choose where Firebase AI Logic runs the inspection.</p>
          </li>
          <li>
            <ArrowUpRight size={24} aria-hidden="true" />
            <h3>See what changed</h3>
            <p>Check the landing page against the campaign price and destination. Review the source under each finding.</p>
          </li>
          <li>
            <BookmarkCheck size={24} aria-hidden="true" />
            <h3>Keep a verified link</h3>
            <p>Review the proposed tracking URL in Chrome. The dashboard records the bookmark after Chrome confirms the saved destination.</p>
          </li>
        </ol>
      </section>

      <section className="site-chrome" id="chrome" aria-labelledby="chrome-heading">
        <div className="site-wrap chrome-layout">
          <div className="chrome-copy">
            <h2 id="chrome-heading">The audit follows you into Chrome.</h2>
            <p>Capture a page from the ROACLAW side panel. Approve the exact bookmark destination and find it again with local search.</p>
            <ol className="install-steps">
              <li>Download and unzip the extension.</li>
              <li>Open <code>chrome://extensions</code>, turn on <strong>Developer mode</strong>, and choose <strong>Load unpacked</strong>.</li>
              <li>Open Growth Audit and choose <strong>Use an approved Chrome capture</strong> to pair.</li>
            </ol>
            <a className="button primary" href={extension} download><ArrowDownToLine size={17} aria-hidden="true" /> Download extension ZIP</a>
          </div>
          <figure className="chrome-demo">
            <div className="chrome-demo-bar"><PanelRight size={16} aria-hidden="true" /> Chrome side panel</div>
            <Image src="/site/chrome-bookmark.webp" width={540} height={1148}
              alt="Chrome side panel after saving the exact campaign URL to Other Bookmarks and verifying it in Chrome"
              sizes="(max-width: 700px) 75vw, 320px" unoptimized />
          </figure>
        </div>
      </section>

      <section className="site-wrap site-section privacy-layout" id="privacy" aria-labelledby="privacy-heading">
        <div className="site-section-title"><h2 id="privacy-heading">Choose where page analysis runs.</h2>
          <p>Each audit shows what Firebase reported for page analysis and cloud review.</p></div>
        <dl className="privacy-list">
          <div><dt>Device only</dt><dd>Gemini Nano 4 on compatible Chrome inspects page fields on this device. Cloud review is off.</dd></div>
          <div><dt>Prefer device</dt><dd>Start on Chrome when the local model is ready. This mode allows cloud review and a cloud fallback.</dd></div>
          <div><dt>Cloud only</dt><dd>Firebase AI Logic sends the selected fields to Gemini for extraction and review. The hosted app requires App Check.</dd></div>
        </dl>
      </section>

      <section className="site-wrap site-section site-questions" aria-labelledby="questions-heading">
        <h2 id="questions-heading">Before you try it</h2>
        <div className="site-faq">
          <details><summary>Do I need an account?</summary><p>Choose <strong>Open demo</strong> in the app to start a private demo session. The sample campaign, prices, and performance figures are synthetic.</p></details>
          <details><summary>What does the Chrome extension read?</summary><p>The extension reads the page you choose after you click <strong>Capture page evidence</strong>. You can review the captured title, headings, prices, and button labels in the side panel.</p></details>
          <details><summary>What does the app store?</summary><p>The demo stores fixture audits, verified bookmark receipts, preferences, and follow-ups in your Firebase workspace. Captures of other pages stay in the open audit tab. Chrome stores approved bookmarks in your browser.</p></details>
        </div>
      </section>

      <div className="site-final">
        <div className="site-wrap site-final-inner">
          <h2>Run the audit on a real page.</h2>
          <Link href="/app/" className="button primary">Open Growth Audit <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </div>
    </main>

    <footer className="site-header site-footer">
      <div className="site-wrap site-nav">
        <SiteBrand />
        <nav aria-label="Footer"><ul>
          <li><Link href="/demo-store/">Demo storefront</Link></li>
          <li><a href="#privacy">Privacy</a></li>
          <li><a href={source}>Source code <ArrowUpRight size={15} aria-hidden="true" /></a></li>
        </ul></nav>
      </div>
    </footer>
  </div>;
}
