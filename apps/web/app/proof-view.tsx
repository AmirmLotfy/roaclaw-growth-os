'use client';

import Image from 'next/image';
import { ArrowUpRight, BookmarkCheck, ScanLine } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';

const views = [
  {
    id: 'audit',
    title: 'Read the audit',
    icon: ScanLine,
    description: 'Check the price, the campaign tag, and the target against the original records.',
    image: '/site/growth-audit.webp',
    width: 1260,
    height: 809,
    alt: 'ROACLAW displays a $99 campaign offer and $119 landing page price with evidence and a bookmark proposal.',
    link: '/app/',
    linkText: 'Open Growth Audit',
  },
  {
    id: 'chrome',
    title: 'Verify the bookmark',
    icon: BookmarkCheck,
    description: 'Chrome reads the saved bookmark back after you approve the exact destination.',
    image: '/site/chrome-bookmark.webp',
    width: 540,
    height: 1148,
    alt: 'The ROACLAW Chrome panel shows the saved campaign link, Other Bookmarks folder and Verified in Chrome receipt.',
    link: '#chrome',
    linkText: 'Install the Chrome extension',
  },
] as const;

export default function ProofView() {
  const [selected, setSelected] = useState(0);
  function selectOnKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const last = views.length - 1;
    const direction = event.key === 'ArrowLeft' ? -1 : 1;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? last : (selected + direction + views.length) % views.length;
    setSelected(next);
    document.getElementById('proof-tab-' + views[next].id)?.focus();
  }

  return <div className="proof-view">
    <div className="proof-tabs" role="tablist" aria-label="Recorded product views">
      {views.map(({ id, title, icon: Icon }, index) =>
        <button type="button" key={id} role="tab" id={'proof-tab-' + id} aria-controls={'proof-panel-' + id}
          aria-selected={selected === index} tabIndex={selected === index ? 0 : -1}
          onClick={() => setSelected(index)} onKeyDown={selectOnKey}>
          <Icon size={18} aria-hidden="true" />{title}
        </button>)}
    </div>
    {views.map((view, index) => <div key={view.id} id={'proof-panel-' + view.id} role="tabpanel"
      aria-labelledby={'proof-tab-' + view.id} hidden={selected !== index} className={'proof-panel proof-' + view.id} tabIndex={0}>
      <div className="proof-media">
        <Image src={view.image} width={view.width} height={view.height} sizes="(max-width: 740px) 95vw, 70vw"
          alt={view.alt} loading="lazy" unoptimized />
      </div>
      <div className="proof-context">
        <p>{view.description}</p>
        <a href={view.link} className="site-text-link">{view.linkText}<ArrowUpRight size={16} aria-hidden="true" /></a>
      </div>
    </div>)}
  </div>;
}
