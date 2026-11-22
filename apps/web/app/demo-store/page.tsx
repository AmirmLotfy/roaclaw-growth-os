import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { DemoCheckout } from './store';

export const metadata: Metadata = {
  title: 'Ceramic Vase Set | Demo Store',
  robots: { index: false, follow: false },
};

export default function DemoStore() {
  return (
    <main className="fixture-site">
      <header className="fixture-brand">SABLE &amp; STEM <span className="flag">Demo store</span></header>
      <section className="fixture-panel">
        <Image className="fixture-image" src="/ceramic-vase-set.webp" width={1000} height={1000}
          alt="Three matte ceramic vases in ivory, clay and sand" sizes="(max-width: 760px) 100vw, 480px" unoptimized priority />
        <div className="fixture-detail">
          <h1>Ceramic Vase Set</h1>
          <p>Three matte stoneware vases in ivory, clay, and sand.</p>
          <p className="fixture-price">$119</p>
          <DemoCheckout />
        </div>
      </section>
      <Link className="text-link" href="/app/">Return to ROACLAW</Link>
    </main>
  );
}
