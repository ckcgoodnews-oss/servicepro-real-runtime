'use client';

import { useState } from 'react';

type Period = 'today' | 'week' | 'month' | 'quarter' | 'year';

type Invoice = { id: string; customer: string; amount: number; status: 'paid' | 'pending' | 'overdue'; date: string; dueDate: string };
type Expense = { id: string; vendor: string; category: string; amount: number; date: string };

const DEMO_INVOICES: Invoice[] = [
  { id: 'INV-1042', customer: 'Thompson Residence', amount: 1850, status: 'paid', date: '2026-07-20', dueDate: '2026-08-04' },
  { id: 'INV-1043', customer: 'Rivera Office Park', amount: 4200, status: 'pending', date: '2026-07-22', dueDate: '2026-08-05' },
  { id: 'INV-1044', customer: 'Park Family', amount: 650, status: 'overdue', date: '2026-07-05', dueDate: '2026-07-19' },
  { id: 'INV-1045', customer: 'Wilson Corp', amount: 12500, status: 'paid', date: '2026-07-18', dueDate: '2026-08-01' },
  { id: 'INV-1046', customer: 'Garcia Home', amount: 380, status: 'pending', date: '2026-07-24', dueDate: '2026-08-07' },
  { id: 'INV-1047', customer: 'Sunrise Cafe', amount: 920, status: 'paid', date: '2026-07-15', dueDate: '2026-07-29' },
  { id: 'INV-1048', customer: 'Tech Solutions Inc', amount: 8750, status: 'pending', date: '2026-07-23', dueDate: '2026-08-06' },
];

const DEMO_EXPENSES: Expense[] = [
  { id: 'e1', vendor: 'Parts Warehouse', category: 'Materials', amount: 2340, date: '2026-07-22' },
  { id: 'e2', vendor: 'Fleet Fuel Co', category: 'Vehicle', amount: 890, date: '2026-07-20' },
  { id: 'e3', vendor: 'Tool Supply Inc', category: 'Equipment', amount: 450, date: '2026-07-18' },
  { id: 'e4', vendor: 'Insurance Corp', category: 'Insurance', amount: 1200, date: '2026-07-01' },
  { id: 'e5', vendor: 'Office Depot', category: 'Office', amount: 180, date: '2026-07-15' },
];

const statusColors = { paid: '#34a853', pending: '#f9ab00', overdue: '#ea4335' };

export function FinancialDashboard() {
  const [period, setPeriod] = useState<Period>('month');

  const totalRevenue = DEMO_INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const outstanding = DEMO_INVOICES.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
  const overdue = DEMO_INVOICES.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
  const totalExpenses = DEMO_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const profit = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? Math.round((profit / totalRevenue) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Period selector */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {(['today', 'week', 'month', 'quarter', 'year'] as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{ padding: '0.4rem 0.9rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: period === p ? 600 : 400, background: period === p ? '#e8f0fe' : 'transparent', color: period === p ? '#1a73e8' : '#5f6368', textTransform: 'capitalize' }}>{p}</button>
        ))}
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
        <Kpi label="Revenue" value={`$${totalRevenue.toLocaleString()}`} color="#34a853" />
        <Kpi label="Outstanding" value={`$${outstanding.toLocaleString()}`} color="#f9ab00" />
        <Kpi label="Overdue" value={`$${overdue.toLocaleString()}`} color="#ea4335" />
        <Kpi label="Expenses" value={`$${totalExpenses.toLocaleString()}`} color="#5f6368" />
        <Kpi label="Net Profit" value={`$${profit.toLocaleString()}`} color={profit >= 0 ? '#34a853' : '#ea4335'} />
        <Kpi label="Margin" value={`${margin}%`} color="#1a73e8" />
      </div>

      {/* Revenue vs Expenses chart placeholder */}
      <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem' }}>Revenue vs Expenses</h3>
          <span style={{ fontSize: '0.8rem', color: '#5f6368' }}>This {period}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '2rem', height: '120px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '60px', height: `${Math.min(100, (totalRevenue / 200))}px`, background: '#34a853', borderRadius: '4px 4px 0 0' }} />
            <p style={{ fontSize: '0.75rem', marginTop: '0.3rem' }}>Revenue</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '60px', height: `${Math.min(100, (totalExpenses / 200))}px`, background: '#ea4335', borderRadius: '4px 4px 0 0' }} />
            <p style={{ fontSize: '0.75rem', marginTop: '0.3rem' }}>Expenses</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '60px', height: `${Math.min(100, (profit / 200))}px`, background: '#1a73e8', borderRadius: '4px 4px 0 0' }} />
            <p style={{ fontSize: '0.75rem', marginTop: '0.3rem' }}>Profit</p>
          </div>
        </div>
      </div>

      {/* Two columns: Invoices + Expenses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Recent Invoices */}
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.95rem' }}>Recent Invoices</h3>
            <a href="/work-orders" style={{ fontSize: '0.8rem', color: '#1a73e8' }}>View all →</a>
          </div>
          {DEMO_INVOICES.slice(0, 5).map(inv => (
            <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f5f5f5' }}>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 500 }}>{inv.customer}</p>
                <p style={{ fontSize: '0.7rem', color: '#9e9e9e' }}>{inv.id} • {inv.date}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>${inv.amount.toLocaleString()}</p>
                <span style={{ fontSize: '0.7rem', background: statusColors[inv.status] + '22', color: statusColors[inv.status], padding: '1px 6px', borderRadius: '3px' }}>{inv.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Expenses */}
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.95rem' }}>Recent Expenses</h3>
            <button style={{ fontSize: '0.8rem', color: '#1a73e8', border: 'none', background: 'none', cursor: 'pointer' }}>+ Add</button>
          </div>
          {DEMO_EXPENSES.map(exp => (
            <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f5f5f5' }}>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 500 }}>{exp.vendor}</p>
                <p style={{ fontSize: '0.7rem', color: '#9e9e9e' }}>{exp.category} • {exp.date}</p>
              </div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ea4335' }}>-${exp.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
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
