'use client';

import dynamic from 'next/dynamic';

const DealsWorkspace = dynamic(
  () => import('@/components/DealsWorkspace').then(m => m.DealsWorkspace),
  { ssr: false, loading: () => <section className="panel" aria-busy="true"><p>Loading Deals…</p></section> }
);

export default function DealsPage() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow"><span aria-hidden="true" /> Revenue</p>
          <h1>Deals Pipeline</h1>
          <p>Manage opportunities, track revenue, and forecast sales performance.</p>
        </div>
      </div>
      <DealsWorkspace />
    </div>
  );
}
