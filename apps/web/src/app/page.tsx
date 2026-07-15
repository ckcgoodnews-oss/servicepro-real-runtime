import Link from 'next/link';
import { PublicHeader } from '@/components/PublicHeader';

const outcomes = [['28%', 'faster dispatch'], ['19 hrs', 'saved each week'], ['4.9/5', 'customer rating']] as const;
const solutions = [
  ['01', 'Dispatch with confidence', 'See every technician, skill, route, and commitment in one calm command center.'],
  ['02', 'Keep assets healthy', 'Move from reactive repair to planned maintenance with complete service history.'],
  ['03', 'Give customers clarity', 'Share arrival windows, approvals, documents, and updates without another phone call.']
] as const;

export default function HomePage() {
  return <main>
    <PublicHeader />
    <section className="hero page-width">
      <div className="hero-copy"><p className="eyebrow"><span /> Field operations, finally in sync</p><h1>Run every service call like your <em>best one.</em></h1><p className="hero-lede">ServicePro connects your office, field teams, assets, and customers—so excellent work becomes the everyday standard.</p><div className="hero-actions"><Link className="button" href="/login">Explore the workspace <span aria-hidden="true">→</span></Link><Link className="button-secondary" href="#solutions">See how it works</Link></div><p className="hero-note">No credit card · Guided setup · Cancel anytime</p></div>
      <div className="hero-product" aria-label="ServicePro dispatch overview preview">
        <div className="product-topbar"><span className="mini-brand">SP</span><span className="product-title">Today’s operations</span><span className="live-pill"><i /> Live</span></div>
        <div className="product-body"><div className="product-summary"><div><small>Jobs today</small><strong>24</strong><span>↑ 12%</span></div><div><small>On schedule</small><strong>92%</strong><span>Strong</span></div><div><small>In the field</small><strong>8</strong><span>2 nearby</span></div></div><div className="dispatch-card"><div className="dispatch-heading"><strong>Active work</strong><span>View schedule</span></div>{[['8:30', 'Water heater inspection', 'M. Carter', 'On site'], ['10:00', 'Backflow preventer service', 'J. Rivera', 'En route'], ['11:30', 'Boiler maintenance', 'A. Brooks', 'Scheduled']].map(([time, job, tech, status]) => <div className="job-row" key={time}><b>{time}</b><span><strong>{job}</strong><small>{tech}</small></span><em>{status}</em></div>)}</div></div>
      </div>
    </section>
    <section className="outcomes page-width" aria-label="Customer outcomes"><p>Built for teams that keep the world working</p><div>{outcomes.map(([value, label]) => <span key={label}><strong>{value}</strong>{label}</span>)}</div></section>
    <section className="solutions page-width" id="solutions"><div className="section-heading"><p className="eyebrow"><span /> One operating system</p><h2>From first call to final invoice.</h2><p>Less chasing. More knowing. Every person gets the context they need to move the work forward.</p></div><div className="solution-grid">{solutions.map(([number, title, description]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p><Link href="/login">Explore capability →</Link></article>)}</div></section>
    <section className="cta-band" id="pricing"><div className="page-width"><div><p className="eyebrow light"><span /> Ready when you are</p><h2>Make tomorrow’s schedule your smoothest yet.</h2></div><Link className="button button-light" href="/login">Open ServicePro →</Link></div></section>
    <footer className="public-footer page-width" id="resources"><div><strong>Service<span>Pro</span></strong><p>Field service, under control.</p></div><p>© 2026 Aardvark Enterprises. All rights reserved.</p></footer>
  </main>;
}
