'use client';

import { useState, useEffect } from 'react';
import { financeApi } from '@/lib/api';

type Invoice = {
  id: string;
  number?: string;
  customerId: string;
  customerName?: string;
  amount: number;
  status: string;
  dueDate?: string;
  createdAt: string;
};

const statusColors: Record<string, string> = { draft: '#9e9e9e', sent: '#4285f4', pending: '#f9ab00', paid: '#34a853', overdue: '#ea4335', cancelled: '#5f6368' };

export function InvoicesDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    financeApi.listInvoices().then(res => {
      if (res.data) setInvoices(res.data as Invoice[]);
      setLoading(false);
    });
  }, []);

  const total = invoices.reduce((s, i) => s + (i.amount || 0), 0);
  const outstanding = invoices.filter(i => ['sent', 'pending', 'overdue'].includes(i.status)).reduce((s, i) => s + (i.amount || 0), 0);
  const paid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount || 0), 0);
  const overdue = invoices.filter(i => i.status === 'overdue');

  if (loading) return <p>Loading invoices...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
        <Kpi label="Total Invoiced" value={`$${total.toLocaleString()}`} color="#202124" />
        <Kpi label="Outstanding" value={`$${outstanding.toLocaleString()}`} color="#f9ab00" />
        <Kpi label="Collected" value={`$${paid.toLocaleString()}`} color="#34a853" />
        <Kpi label="Overdue" value={String(overdue.length)} color="#ea4335" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '0.95rem' }}>All Invoices ({invoices.length})</h3>
        <button style={{ padding: '0.5rem 1rem', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>+ Create Invoice</button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'auto' }}>
        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>Invoice</th>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>Customer</th>
              <th style={{ padding: '0.6rem', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>Due Date</th>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#5f6368' }}>No invoices yet</td></tr>}
            {invoices.map(inv => (
              <tr key={inv.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '0.5rem 0.6rem', fontWeight: 500 }}>{inv.number || inv.id.slice(0, 12)}</td>
                <td style={{ padding: '0.5rem 0.6rem' }}>{inv.customerName || inv.customerId}</td>
                <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', fontWeight: 600 }}>${(inv.amount || 0).toLocaleString()}</td>
                <td style={{ padding: '0.5rem 0.6rem' }}><span style={{ background: (statusColors[inv.status] || '#9e9e9e') + '22', color: statusColors[inv.status] || '#9e9e9e', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{inv.status}</span></td>
                <td style={{ padding: '0.5rem 0.6rem', color: '#5f6368' }}>{inv.dueDate || '—'}</td>
                <td style={{ padding: '0.5rem 0.6rem', color: '#5f6368' }}>{inv.createdAt?.slice(0, 10) || '—'}</td>
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
