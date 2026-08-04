'use client';

import dynamic from 'next/dynamic';

const TicketsWorkspace = dynamic(
  () => import('@/components/TicketsWorkspace').then(m => m.TicketsWorkspace),
  { ssr: false, loading: () => <section className="panel" aria-busy="true"><p>Loading Service Desk…</p></section> }
);

export default function TicketsPage() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow"><span aria-hidden="true" /> Service</p>
          <h1>Service Desk</h1>
          <p>Manage support tickets, track SLAs, and resolve customer issues efficiently.</p>
        </div>
      </div>
      <TicketsWorkspace />
    </div>
  );
}
