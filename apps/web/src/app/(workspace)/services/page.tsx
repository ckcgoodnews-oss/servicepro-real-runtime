'use client';

import dynamic from 'next/dynamic';

const ServicesManager = dynamic(
  () => import('@/components/ServicesManager').then(m => m.ServicesManager),
  { ssr: false, loading: () => <section className="panel" aria-busy="true"><p>Loading services…</p></section> }
);

export default function ServicesPage() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow"><span aria-hidden="true" /> Catalog</p>
          <h1>Services</h1>
          <p>Define your service catalog, pricing, and categories.</p>
        </div>
      </div>
      <ServicesManager />
    </div>
  );
}
