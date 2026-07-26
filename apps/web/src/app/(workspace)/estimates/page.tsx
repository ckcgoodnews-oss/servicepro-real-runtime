'use client';

import dynamic from 'next/dynamic';

const EstimatesView = dynamic(
  () => import('@/components/EstimatesView').then(m => m.EstimatesView),
  { ssr: false, loading: () => <section className="panel" aria-busy="true"><p>Loading estimates…</p></section> }
);

export default function EstimatesPage() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow"><span aria-hidden="true" /> Sales</p>
          <h1>Estimates</h1>
          <p>Create estimates, send proposals, and convert approved quotes into work orders.</p>
        </div>
      </div>
      <EstimatesView />
    </div>
  );
}
