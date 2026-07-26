'use client';

export function DashboardView() {
  return (
    <div>
      <div className="page-header">
        <h1>Welcome back</h1>
        <p>Here&apos;s an overview of your account</p>
      </div>

      <div className="grid-cards" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <p className="stat-label">Next Appointment</p>
          <p className="stat-value" style={{ fontSize: '1.25rem' }}>No upcoming</p>
          <a href="/appointments" style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>Schedule service →</a>
        </div>
        <div className="card">
          <p className="stat-label">Open Invoices</p>
          <p className="stat-value">0</p>
          <a href="/invoices" style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>View invoices →</a>
        </div>
        <div className="card">
          <p className="stat-label">Pending Estimates</p>
          <p className="stat-value">0</p>
          <a href="/estimates" style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>View estimates →</a>
        </div>
        <div className="card">
          <p className="stat-label">Unread Messages</p>
          <p className="stat-value">0</p>
          <a href="/messages" style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>View messages →</a>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Recent Activity</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          No recent activity. Schedule a service appointment to get started.
        </p>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
        <a href="/appointments" className="btn btn-primary">Book Appointment</a>
        <a href="/support" className="btn btn-outline">Contact Support</a>
      </div>
    </div>
  );
}
