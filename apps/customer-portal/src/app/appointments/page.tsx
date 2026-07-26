'use client';

import { PortalShell } from '@/components/PortalShell';

export default function AppointmentsPage() {
  return (
    <PortalShell activePath="/appointments">
      <div className="page-header">
        <h1>Appointments</h1>
        <p>Schedule, view, and manage your service appointments</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="btn btn-primary">Book New Appointment</button>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Upcoming</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          No upcoming appointments scheduled.
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Past Appointments</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Your completed service appointments will appear here.
        </p>
      </div>
    </PortalShell>
  );
}
