import type { Metadata } from 'next';
import Link from 'next/link';
import { DemoCheckout } from '../demo-store/store';

export const metadata: Metadata = {
  title: 'Field Notebook | Northline Retail',
  robots: { index: false, follow: false },
};

export default function NorthlineOffer() {
  return <main className="fixture-site">
    <header className="fixture-brand">NORTHLINE RETAIL <span className="flag">Demo store</span></header>
    <section className="fixture-summary">
      <h1>Field Notebook</h1>
      <p>A ruled pocket notebook, 80 recycled-paper pages.</p>
      <p className="fixture-price">$18</p>
      <DemoCheckout />
    </section>
    <Link className="text-link" href="/app/">Return to ROACLAW</Link>
  </main>;
}
