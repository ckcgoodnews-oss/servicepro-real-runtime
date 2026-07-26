'use client';

import { PortalShell } from '@/components/PortalShell';

export default function SupportPage() {
  return (
    <PortalShell activePath="/support">
      <div className="page-header">
        <h1>Get Support</h1>
        <p>Need help? We&apos;re here for you</p>
      </div>

      <div className="grid-cards">
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem' }}>📞 Call Us</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            Speak directly with our support team during business hours.
          </p>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem' }}>📧 Email Support</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            Send us a message and we&apos;ll respond within 24 hours.
          </p>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem' }}>🚨 Emergency Service</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            For urgent issues outside business hours.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Submit a Request</h2>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 500 }}>Subject</label>
            <input type="text" placeholder="Brief description of your issue" style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 500 }}>Details</label>
            <textarea rows={4} placeholder="Please provide as much detail as possible" style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', resize: 'vertical' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Submit Request</button>
        </form>
      </div>
    </PortalShell>
  );
}
