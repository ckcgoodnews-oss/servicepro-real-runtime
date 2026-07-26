'use client';

import { PortalShell } from '@/components/PortalShell';

export default function MessagesPage() {
  return (
    <PortalShell activePath="/messages">
      <div className="page-header">
        <h1>Messages</h1>
        <p>Communicate directly with your service team</p>
      </div>

      <div className="card">
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          No messages yet. Start a conversation with your service provider.
        </p>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }}>New Message</button>
      </div>
    </PortalShell>
  );
}
