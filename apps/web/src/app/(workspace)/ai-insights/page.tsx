'use client';

import dynamic from 'next/dynamic';

const AiInsightsPanel = dynamic(
  () => import('@/components/AiInsightsPanel').then(m => m.AiInsightsPanel),
  { ssr: false, loading: () => <section className="panel" aria-busy="true"><p>Loading AI Insights…</p></section> }
);

export default function AiInsightsPage() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow"><span aria-hidden="true" /> Intelligence</p>
          <h1>AI Insights</h1>
          <p>AI-powered recommendations for deals, customers, tickets, and operations.</p>
        </div>
      </div>
      <AiInsightsPanel />
    </div>
  );
}
