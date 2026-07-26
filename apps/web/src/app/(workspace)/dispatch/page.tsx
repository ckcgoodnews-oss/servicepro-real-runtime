'use client';

import dynamic from 'next/dynamic';

const DispatchBoard = dynamic(
  () => import('@/components/DispatchBoard').then(m => m.DispatchBoard),
  { ssr: false, loading: () => <section className="panel" aria-busy="true"><p>Loading dispatch board…</p></section> }
);

export default function DispatchPage() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow"><span aria-hidden="true" /> Operations</p>
          <h1>Dispatch Board</h1>
          <p>Live view of technician assignments, job status, and route optimization.</p>
        </div>
      </div>
      <DispatchBoard />
    </div>
  );
}
