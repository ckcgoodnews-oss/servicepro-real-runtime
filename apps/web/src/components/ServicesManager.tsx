'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

type Service = { id: string; name: string; description?: string; category?: string; basePrice?: number; duration?: string; active?: boolean };

export function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Service[]>('GET', '/api/v1/services').then(res => {
      if (res.data) setServices(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading services...</p>;

  const active = services.filter(s => s.active !== false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
        <Kpi label="Total Services" value={String(services.length)} color="#1a73e8" />
        <Kpi label="Active" value={String(active.length)} color="#34a853" />
        <Kpi label="Avg Price" value={active.length > 0 ? `$${Math.round(active.reduce((s, srv) => s + (srv.basePrice || 0), 0) / active.length)}` : '$0'} color="#e67c00" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '0.95rem' }}>Service Catalog</h3>
        <button style={{ padding: '0.5rem 1rem', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>+ Add Service</button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'auto' }}>
        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>Service</th>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '0.6rem', textAlign: 'right' }}>Price</th>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>Duration</th>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 && <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#5f6368' }}>No services defined yet</td></tr>}
            {services.map(srv => (
              <tr key={srv.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '0.5rem 0.6rem' }}><strong>{srv.name}</strong>{srv.description && <p style={{ fontSize: '0.75rem', color: '#5f6368' }}>{srv.description.slice(0, 60)}</p>}</td>
                <td style={{ padding: '0.5rem 0.6rem' }}>{srv.category || '—'}</td>
                <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', fontWeight: 600 }}>{srv.basePrice ? `$${srv.basePrice}` : '—'}</td>
                <td style={{ padding: '0.5rem 0.6rem' }}>{srv.duration || '—'}</td>
                <td style={{ padding: '0.5rem 0.6rem' }}><span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: srv.active !== false ? '#e6f4ea' : '#f5f5f5', color: srv.active !== false ? '#34a853' : '#9e9e9e' }}>{srv.active !== false ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
      <p style={{ fontSize: '1.4rem', fontWeight: 700, color }}>{value}</p>
      <p style={{ fontSize: '0.75rem', color: '#5f6368' }}>{label}</p>
    </div>
  );
}
