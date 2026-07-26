'use client';

import { MobileShell } from '@/components/MobileShell';

export default function NavigatePage() {
  return (
    <MobileShell activePath="/navigate" title="Navigate">
      <div className="m-card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🗺</p>
        <h3 style={{ marginBottom: '0.5rem' }}>Turn-by-Turn Navigation</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Get optimized routes to your next job site
        </p>
      </div>

      <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '1rem 0 0.5rem' }}>Today&apos;s Route</h3>
      {[
        { time: '10:00 AM', address: '55 Maple St', customer: 'Park Family', distance: '4.2 mi', eta: '12 min' },
        { time: '1:30 PM', address: '221 Pine Ave', customer: 'Garcia Home', distance: '6.8 mi', eta: '18 min' },
        { time: '3:00 PM', address: '142 Oak Lane', customer: 'Thompson', distance: '3.1 mi', eta: '9 min' },
      ].map((stop, i) => (
        <div key={i} className="m-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{stop.customer}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {stop.address}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>{stop.distance}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{stop.eta}</p>
          </div>
        </div>
      ))}

      <button className="m-btn m-btn-primary" style={{ marginTop: '1rem' }}>Start Navigation</button>
    </MobileShell>
  );
}
