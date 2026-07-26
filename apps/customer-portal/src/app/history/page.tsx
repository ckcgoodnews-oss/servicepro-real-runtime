'use client';

import { PortalShell } from '@/components/PortalShell';

export default function ServiceHistoryPage() {
  return (
    <PortalShell activePath="/history">
      <div className="page-header">
        <h1>Service History</h1>
        <p>Complete record of all services performed at your property</p>
      </div>

      <div className="card">
        <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem 0' }}>Date</th>
              <th>Service</th>
              <th>Technician</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                No service history yet
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}
