'use client';

import dynamic from 'next/dynamic';

const InvoicesDashboard = dynamic(
  () => import('@/components/InvoicesDashboard').then(m => m.InvoicesDashboard),
  { ssr: false, loading: () => <section className="panel" aria-busy="true"><p>Loading invoices…</p></section> }
);

export default function InvoicesPage() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow"><span aria-hidden="true" /> Billing</p>
          <h1>Invoices</h1>
          <p>Create, send, and track invoices. Process payments and manage receivables.</p>
        </div>
      </div>
      <InvoicesDashboard />
    </div>
  );
}
