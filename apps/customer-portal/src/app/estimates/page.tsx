'use client';

import { PortalShell } from '@/components/PortalShell';

export default function EstimatesPage() {
  return (
    <PortalShell activePath="/estimates">
      <div className="page-header">
        <h1>Estimates</h1>
        <p>Review and approve service estimates</p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Pending Approval</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          No estimates waiting for your approval.
        </p>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>All Estimates</h2>
        <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem 0' }}>Estimate #</th>
              <th>Service</th>
              <th>Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                No estimates yet
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}
