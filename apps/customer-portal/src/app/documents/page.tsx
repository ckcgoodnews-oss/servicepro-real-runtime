'use client';

import { PortalShell } from '@/components/PortalShell';

export default function DocumentsPage() {
  return (
    <PortalShell activePath="/documents">
      <div className="page-header">
        <h1>Documents</h1>
        <p>Access contracts, warranties, manuals, and service reports</p>
      </div>

      <div className="card">
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          No documents available yet.
        </p>
      </div>
    </PortalShell>
  );
}
