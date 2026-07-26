'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

type Estimate = {
  id: string;
  number?: string;
  customerId: string;
  customerName?: string;
  title?: string;
  amount: number;
  status: string;
  validUntil?: string;
  createdAt: string;
};

const statusColors: Record<string, string> = { draft: '#9e9e9e', sent: '#4285f4', viewed: '#e67c00', approved: '#34a853', declined: '#ea4335', expired: '#5f6368', converted: '#1a73e8' };

export function EstimatesView() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Estimate[]>('GET', '/api/v1/estimates').then(res => {
      if (res.data) setEstimates(res.data);
      setLoading(false);
    });
  }, []);

  const totalValue = estimates.reduce((s, e) => s + (e.amount || 0), 0);
  const approved = estimates.filter(e => e.status === 'approved');
  const pending = estimates.filter(e => ['sent', 'viewed'].includes(e.status));
  const conversionRate = estimates.length > 0 ? Math.round((approved.length / estimates.length) * 100) : 0;

  if (loading) return <p>Loading estimates...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
        <Kpi label="Total Quoted" value={`$${totalValue.toLocaleString()}`} color="#202124" />
        <Kpi label="Pending" value={String(pending.length)} color="#f9ab00" />
        <Kpi label="Approved" value={String(approved.length)} color="#34a853" />
        <Kpi label="Conversion" value={`${conversionRate}%`} color="#1a73e8" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '0.95rem' }}>All Estimates ({estimates.length})</h3>
        <button style={{ padding: '0.5rem 1rem', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>+ Create Estimate</button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'auto' }}>
        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>Estimate</th>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>Customer</th>
              <th style={{ padding: '0.6rem', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>Valid Until</th>
              <th style={{ padding: '0.6rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {estimates.length === 0 && <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#5f6368' }}>No estimates yet</td></tr>}
            {estimates.map(est => (
              <tr key={est.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '0.5rem 0.6rem' }}><strong>{est.title || est.number || est.id.slice(0, 12)}</strong></td>
                <td style={{ padding: '0.5rem 0.6rem' }}>{est.customerName || est.customerId}</td>
                <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', fontWeight: 600 }}>${(est.amount || 0).toLocaleString()}</td>
                <td style={{ padding: '0.5rem 0.6rem' }}><span style={{ background: (statusColors[est.status] || '#9e9e9e') + '22', color: statusColors[est.status] || '#9e9e9e', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{est.status}</span></td>
                <td style={{ padding: '0.5rem 0.6rem', color: '#5f6368' }}>{est.validUntil || '—'}</td>
                <td style={{ padding: '0.5rem 0.6rem' }}><button style={{ padding: '0.25rem 0.5rem', border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>View</button></td>
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
