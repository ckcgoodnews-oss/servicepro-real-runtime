'use client';

import { PortalShell } from '@/components/PortalShell';

export default function ProfilePage() {
  return (
    <PortalShell activePath="/profile">
      <div className="page-header">
        <h1>Profile & Settings</h1>
        <p>Manage your account information and preferences</p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Personal Information</h2>
        <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: '600px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 500 }}>First Name</label>
            <input type="text" style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 500 }}>Last Name</label>
            <input type="text" style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 500 }}>Email</label>
            <input type="email" style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 500 }}>Phone</label>
            <input type="tel" style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }} />
          </div>
        </form>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Save Changes</button>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Service Address</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Your primary service address on file.
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Notification Preferences</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <input type="checkbox" defaultChecked /> Email notifications for appointments
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <input type="checkbox" defaultChecked /> SMS reminders
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <input type="checkbox" defaultChecked /> Invoice notifications
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <input type="checkbox" /> Marketing communications
          </label>
        </div>
      </div>
    </PortalShell>
  );
}
