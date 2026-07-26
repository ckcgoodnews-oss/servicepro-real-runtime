'use client';

import dynamic from 'next/dynamic';

const InventoryDashboard = dynamic(
  () => import('@/components/InventoryDashboard').then(m => m.InventoryDashboard),
  { ssr: false, loading: () => <section className="panel" aria-busy="true"><p>Loading inventory…</p></section> }
);

export default function InventoryPage() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow"><span aria-hidden="true" /> Operations</p>
          <h1>Inventory</h1>
          <p>Track parts, materials, and supplies across warehouses and trucks.</p>
        </div>
      </div>
      <InventoryDashboard />
    </div>
  );
}
