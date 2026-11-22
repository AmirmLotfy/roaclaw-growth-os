import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDownToLine, ArrowRight, ArrowUpRight } from 'lucide-react';
import '@fontsource/archivo-black/latin-400.css';
import ProofView from './proof-view';
import './site.css';

const repo = 'https://github.com/AmirmLotfy/roaclaw-growth-os';
const extension = '/roaclaw-extension.zip';

export const metadata: Metadata = {
  title: 'ROACLAW — Check the ad against the page',
  description: 'Check your campaign offer, call to action, and tracking against a real landing page with the ROACLAW Chrome companion.',
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
          <li><a href="#preflight">Campaign Preflight</a></li>
          <li><a href="#proof">The audit</a></li>
          <li><a href="#chrome">Chrome extension</a></li>
          <li><a href="#privacy">Privacy</a></li>
        </ul></nav>
        <a href="/app/" className="site-top-link">Open app <ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>
    </header>

    <main id="product">
      <section className="site-hero">
        <div className="site-wrap hero-layout">
          <div className="hero-copy">
            <h1><span>The ad said <em>$99.</em></span><span>The page said <em>$119.</em></span></h1>
            <p>Compare a campaign with the page it sends people to. Find the price or tracking gap and see the evidence behind it.</p>
            <div className="site-actions">
              <a href="/app/preflight/" className="site-button">Check your own landing page <ArrowUpRight size={18} aria-hidden="true" /></a>
              <a href="/app/" className="site-text-link">Open Growth Audit <ArrowUpRight size={16} aria-hidden="true" /></a>
            </div>
          </div>

          <figure className="hero-art">
            <Image src="/ceramic-vase-set.webp" width={1000} height={1000} priority unoptimized
              sizes="(max-width: 780px) 95vw, 47vw" alt="Ivory, rust and sand stoneware vases from the Sable & Stem demo storefront" />
            <div className="hero-rule" aria-hidden="true"><span /></div>
            <figcaption>Sable &amp; Stem · Demo campaign</figcaption>
          </figure>
        </div>
        <div className="site-wrap hero-index" aria-label="The campaign audit sequence">
          <span>Campaign offer</span><ArrowRight aria-hidden="true" size={17} />
          <span>Landing page evidence</span><ArrowRight aria-hidden="true" size={17} />
          <span>Reviewed action</span>
        </div>
      </section>

      <section className="site-wrap site-section preflight-site" id="preflight" aria-labelledby="preflight-site-heading">
        <div className="site-section-title">
          <h2 id="preflight-site-heading">Before the ad goes live.</h2>
          <p>Bring the campaign brief and open the page in Chrome. You’ll see what matches, what differs, and what still needs a decision.</p>
          <a href="/app/preflight/" className="site-text-link">Start Campaign Preflight <ArrowUpRight size={17} aria-hidden="true" /></a>
        </div>
        <dl className="preflight-site-checks">
          <div><dt>The brief</dt><dd>Enter the promised offer, destination, and call to action. Add the advertised price and required campaign tags if you use them.</dd></div>
          <div><dt>The capture</dt><dd>Use the Chrome side panel to read visible headings, prices, and buttons from the selected public tab.</dd></div>
          <div><dt>The review</dt><dd>Compare both sources and download the report. Copy the suggested tracking link when a tag needs attention.</dd></div>
        </dl>
      </section>

      <section className="site-wrap site-section" id="proof" aria-labelledby="proof-heading">
        <div className="site-section-title proof-heading">
          <h2 id="proof-heading">See the discrepancy in context.</h2>
          <p>The Growth Audit links each finding to its source. Compare what Chrome observed, what the campaign says, and what needs a human decision.</p>
        </div>
        <ProofView />
      </section>

      <section className="site-chrome" id="chrome" aria-labelledby="chrome-heading">
        <div className="site-wrap chrome-layout">
          <div className="chrome-copy">
            <h2 id="chrome-heading">Keep the page in view.</h2>
            <p>The Chrome side panel captures what you choose, prepares the approved bookmark, and searches saved links or recent public pages locally.</p>
            <ol className="install-steps">
              <li>Download and unzip the extension.</li>
              <li>Open <code>chrome://extensions</code>, turn on <strong>Developer mode</strong>, and choose <strong>Load unpacked</strong>.</li>
              <li>Start Campaign Preflight or open <strong>Use an approved Chrome capture</strong> in Growth Audit. Confirm the connection in Chrome.</li>
            </ol>
            <a className="site-button" href={extension} download>Download extension ZIP <ArrowDownToLine size={18} aria-hidden="true" /></a>
          </div>
          <figure className="chrome-demo">
            <Image src="/site/chrome-capture.webp" width={540} height={1148} loading="lazy" unoptimized
              sizes="(max-width: 700px) 72vw, 315px" alt="The Chrome companion shows the captured Ceramic Vase Set page with one heading, price, and button." />
            <figcaption>Actual Chrome page capture</figcaption>
          </figure>
        </div>
      </section>

      <section className="site-wrap site-section privacy-layout" id="privacy" aria-labelledby="privacy-heading">
        <div className="site-section-title"><h2 id="privacy-heading">Where the page gets read.</h2>
          <p>Each audit names the source Firebase reported. Choose what can leave your device before you run it.</p></div>
        <dl className="privacy-list">
          <div><dt>Device only</dt><dd>Gemini Nano 4 on compatible Chrome inspects the selected page fields on this device.</dd></div>
          <div><dt>Prefer device</dt><dd>Chrome reads the demo page locally when its model is ready. This mode also permits cloud fallback and a separate cloud review.</dd></div>
          <div><dt>Cloud only</dt><dd>Firebase AI Logic sends the selected demo fields to Gemini for extraction and review. App Check protects the cloud calls.</dd></div>
          <div><dt>Campaign Preflight</dt><dd>Your brief and captured evidence stay in the current browser session. Compatible Chrome can inspect the capture on-device. You can export the report yourself.</dd></div>
        </dl>
      </section>

      <section className="site-wrap site-section site-questions" aria-labelledby="questions-heading">
        <h2 id="questions-heading">Before you begin.</h2>
        <div className="site-faq">
          <details><summary>Can I try it without an account?</summary><p>Campaign Preflight works without an account. To see the hybrid demo, choose <strong>Open demo</strong> in Growth Audit and pick a workspace with synthetic records.</p></details>
          <details><summary>Which Chrome setup do I need?</summary><p>The device route requires Chrome Desktop and Gemini Nano 4. <a href="https://firebase.google.com/docs/ai-logic/hybrid/web/get-started">Check Firebase’s setup guide</a> to get the model. Prefer device can use the cloud on a browser without Nano.</p></details>
          <details><summary>What gets saved?</summary><p>The workspace saves demo audits, approved bookmark receipts, research notes, and follow-ups. Bookmarks and recent-history searches stay in Chrome.</p></details>
        </div>
      </section>

      <div className="site-final">
        <div className="site-wrap site-final-inner">
          <h2>Check the page.</h2>
          <a href="/app/preflight/" className="site-button">Start Campaign Preflight <ArrowUpRight size={18} aria-hidden="true" /></a>
        </div>
      </div>
    </main>

    <footer className="site-footer">
      <div className="site-wrap site-nav">
        <SiteBrand />
        <nav aria-label="Footer"><ul>
          <li><Link href="/demo-store/">Demo storefront</Link></li>
          <li><a href="#privacy">Privacy</a></li>
          <li><a href={repo}>Source code <ArrowUpRight size={15} aria-hidden="true" /></a></li>
        </ul></nav>
      </div>
    </footer>
  </div>;
}
