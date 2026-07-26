'use client';

import dynamic from 'next/dynamic';

const MarketingHub = dynamic(
  () => import('@/components/MarketingHub').then(m => m.MarketingHub),
  { ssr: false, loading: () => <section className="panel" aria-busy="true"><p>Loading marketing…</p></section> }
);

export default function MarketingPage() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow"><span aria-hidden="true" /> Growth</p>
          <h1>Marketing</h1>
          <p>Campaigns, reviews, referrals, and customer engagement tools.</p>
        </div>
      </div>
      <MarketingHub />
    </div>
  );
}
