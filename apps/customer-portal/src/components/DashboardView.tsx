'use client';

import { useEffect, useState } from 'react';
import { getBookings, getInvoices, getEstimates, isAuthenticated, getStoredEmail } from '@/lib/api';

type Stats = { nextAppointment: string; openInvoices: number; pendingEstimates: number; };

export function DashboardView() {
  const [stats, setStats] = useState<Stats>({ nextAppointment: 'Loading...', openInvoices: 0, pendingEstimates: 0 });
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) { window.location.href = '/login'; return; }
    setEmail(getStoredEmail());

    async function load() {
      const [bookingsRes, invoicesRes, estimatesRes] = await Promise.all([getBookings(), getInvoices(), getEstimates()]);

      const bookings = 'data' in bookingsRes ? bookingsRes.data : [];
      const invoices = 'data' in invoicesRes ? invoicesRes.data : [];
      const estimates = 'data' in estimatesRes ? estimatesRes.data : [];

      const upcoming = bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
      const openInv = invoices.filter(i => i.status === 'pending' || i.status === 'overdue');
      const pendingEst = estimates.filter(e => e.status === 'pending' || e.status === 'sent');

      setStats({
        nextAppointment: upcoming.length > 0 ? upcoming[0].preferredDate || 'Scheduled' : 'No upcoming',
        openInvoices: openInv.length,
        pendingEstimates: pendingEst.length,
      });
    }
    load();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back{email ? `, ${email.split('@')[0]}` : ''}</h1>
        <p>Here&apos;s an overview of your account</p>
      </div>

      <div className="grid-cards" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <p className="stat-label">Next Appointment</p>
          <p className="stat-value" style={{ fontSize: '1.25rem' }}>{stats.nextAppointment}</p>
          <a href="/appointments" style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>Schedule service →</a>
        </div>
        <div className="card">
          <p className="stat-label">Open Invoices</p>
          <p className="stat-value">{stats.openInvoices}</p>
          <a href="/invoices" style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>View invoices →</a>
        </div>
        <div className="card">
          <p className="stat-label">Pending Estimates</p>
          <p className="stat-value">{stats.pendingEstimates}</p>
          <a href="/estimates" style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>View estimates →</a>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <a href="/appointments" className="btn btn-primary">Book Appointment</a>
        <a href="/support" className="btn btn-outline">Contact Support</a>
      </div>
    </div>
  );
}
