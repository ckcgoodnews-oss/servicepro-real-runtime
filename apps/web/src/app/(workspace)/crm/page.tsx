'use client';

import dynamic from 'next/dynamic';

const CrmPipeline = dynamic(
  () => import('@/components/CrmPipeline').then(m => m.CrmPipeline),
  { ssr: false, loading: () => <section className="panel" aria-busy="true"><p>Loading CRM…</p></section> }
);

export default function CrmPage() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow"><span aria-hidden="true" /> Sales</p>
          <h1>CRM Pipeline</h1>
          <p>Track leads, manage opportunities, and convert prospects into customers.</p>
        </div>
      </div>
      <CrmPipeline />
    </div>
  );
}
