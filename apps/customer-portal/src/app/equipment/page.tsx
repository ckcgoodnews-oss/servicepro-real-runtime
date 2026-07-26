'use client';

import { PortalShell } from '@/components/PortalShell';

export default function EquipmentPage() {
  return (
    <PortalShell activePath="/equipment">
      <div className="page-header">
        <h1>My Equipment</h1>
        <p>Track your equipment, warranties, and maintenance schedules</p>
      </div>

      <div className="card">
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          No equipment registered yet. Your service provider will add equipment records after service visits.
        </p>
      </div>
    </PortalShell>
  );
}
