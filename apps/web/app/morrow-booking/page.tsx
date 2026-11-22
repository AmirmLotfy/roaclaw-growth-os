import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Book a dental cleaning | Morrow Dental',
  robots: { index: false, follow: false },
};

export default function MorrowBooking() {
  return <main className="fixture-site">
    <header className="fixture-brand">MORROW DENTAL <span className="flag">Demo site</span></header>
    <section className="fixture-summary">
      <h1>Book a dental cleaning</h1>
      <p>Find out about routine cleanings and first appointments.</p>
      <a className="button primary" href="#contact">Contact us</a>
      <div id="contact"><h2>Contact desk</h2><p>This demo page collects no information and makes no bookings.</p></div>
    </section>
    <Link className="text-link" href="/app/">Return to ROACLAW</Link>
  </main>;
}
