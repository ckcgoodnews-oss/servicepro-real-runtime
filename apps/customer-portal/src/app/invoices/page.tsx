'use client';

import { PortalShell } from '@/components/PortalShell';

export default function InvoicesPage() {
  return (
    <PortalShell activePath="/invoices">
      <div className="page-header">
        <h1>Invoices & Payments</h1>
        <p>View invoices, make payments, and download receipts</p>
      </div>

      <div className="grid-cards" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <p className="stat-label">Outstanding Balance</p>
          <p className="stat-value">$0.00</p>
        </div>
        <div className="card">
          <p className="stat-label">Total Paid (YTD)</p>
          <p className="stat-value">$0.00</p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Invoice History</h2>
        <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem 0' }}>Invoice #</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                No invoices yet
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}
