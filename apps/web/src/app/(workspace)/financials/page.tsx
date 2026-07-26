'use client';

import dynamic from 'next/dynamic';

const FinancialDashboard = dynamic(
  () => import('@/components/FinancialDashboard').then(m => m.FinancialDashboard),
  { ssr: false, loading: () => <section className="panel" aria-busy="true"><p>Loading financials…</p></section> }
);

export default function FinancialsPage() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow"><span aria-hidden="true" /> Finance</p>
          <h1>Financial Dashboard</h1>
          <p>Revenue, expenses, profit margins, and cash flow at a glance.</p>
        </div>
      </div>
      <FinancialDashboard />
    </div>
  );
}
