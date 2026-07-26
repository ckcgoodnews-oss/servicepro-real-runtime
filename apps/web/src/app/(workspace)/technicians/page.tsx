'use client';

import dynamic from 'next/dynamic';

const TechniciansView = dynamic(
  () => import('@/components/TechniciansView').then(m => m.TechniciansView),
  { ssr: false, loading: () => <section className="panel" aria-busy="true"><p>Loading technicians…</p></section> }
);

export default function TechniciansPage() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow"><span aria-hidden="true" /> Team</p>
          <h1>Technicians</h1>
          <p>Manage your field team, skills, certifications, and availability.</p>
        </div>
      </div>
      <TechniciansView />
    </div>
  );
}
