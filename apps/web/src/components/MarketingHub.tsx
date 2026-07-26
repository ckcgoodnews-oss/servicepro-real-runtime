'use client';

import { useState } from 'react';

type Campaign = {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'review_request' | 'referral' | 'coupon';
  status: 'draft' | 'active' | 'paused' | 'completed';
  sent: number;
  opened: number;
  converted: number;
  createdAt: string;
};

type ReviewRequest = {
  id: string;
  customer: string;
  platform: 'google' | 'facebook' | 'yelp';
  status: 'sent' | 'completed' | 'declined';
  rating?: number;
  sentAt: string;
};

const DEMO_CAMPAIGNS: Campaign[] = [
  { id: 'c1', name: 'Summer AC Tune-Up Special', type: 'email', status: 'active', sent: 342, opened: 187, converted: 23, createdAt: '2026-07-01' },
  { id: 'c2', name: 'Review Request - July Jobs', type: 'review_request', status: 'active', sent: 45, opened: 38, converted: 12, createdAt: '2026-07-15' },
  { id: 'c3', name: 'Referral Bonus $50', type: 'referral', status: 'active', sent: 120, opened: 89, converted: 7, createdAt: '2026-06-15' },
  { id: 'c4', name: 'Fall Maintenance Reminder', type: 'sms', status: 'draft', sent: 0, opened: 0, converted: 0, createdAt: '2026-07-24' },
  { id: 'c5', name: '10% First-Time Customer', type: 'coupon', status: 'completed', sent: 500, opened: 312, converted: 45, createdAt: '2026-05-01' },
];

const DEMO_REVIEWS: ReviewRequest[] = [
  { id: 'r1', customer: 'Thompson Family', platform: 'google', status: 'completed', rating: 5, sentAt: '2026-07-20' },
  { id: 'r2', customer: 'Rivera Office', platform: 'google', status: 'sent', sentAt: '2026-07-22' },
  { id: 'r3', customer: 'Wilson Corp', platform: 'facebook', status: 'completed', rating: 4, sentAt: '2026-07-18' },
  { id: 'r4', customer: 'Garcia Home', platform: 'yelp', status: 'declined', sentAt: '2026-07-15' },
  { id: 'r5', customer: 'Park Family', platform: 'google', status: 'completed', rating: 5, sentAt: '2026-07-14' },
];

const typeIcons = { email: '📧', sms: '💬', review_request: '⭐', referral: '🤝', coupon: '🎟' };
const statusColors = { draft: '#9e9e9e', active: '#34a853', paused: '#f9ab00', completed: '#5f6368' };
const platformIcons = { google: '🔍', facebook: '📘', yelp: '🟡' };

export function MarketingHub() {
  const [tab, setTab] = useState<'campaigns' | 'reviews' | 'referrals'>('campaigns');

  const totalSent = DEMO_CAMPAIGNS.reduce((s, c) => s + c.sent, 0);
  const totalConverted = DEMO_CAMPAIGNS.reduce((s, c) => s + c.converted, 0);
  const avgRating = DEMO_REVIEWS.filter(r => r.rating).reduce((s, r) => s + (r.rating || 0), 0) / (DEMO_REVIEWS.filter(r => r.rating).length || 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
        <Kpi label="Campaigns Active" value={String(DEMO_CAMPAIGNS.filter(c => c.status === 'active').length)} color="#34a853" />
        <Kpi label="Messages Sent" value={totalSent.toLocaleString()} color="#1a73e8" />
        <Kpi label="Conversions" value={String(totalConverted)} color="#e67c00" />
        <Kpi label="Avg Rating" value={avgRating.toFixed(1)} color="#f9ab00" />
        <Kpi label="Reviews Collected" value={String(DEMO_REVIEWS.filter(r => r.status === 'completed').length)} color="#4285f4" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e0e0e0', paddingBottom: '0.5rem' }}>
        {(['campaigns', 'reviews', 'referrals'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: tab === t ? 600 : 400, background: tab === t ? '#e8f0fe' : 'transparent', color: tab === t ? '#1a73e8' : '#5f6368', textTransform: 'capitalize' }}>{t}</button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <button style={{ padding: '0.5rem 1rem', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>+ New Campaign</button>
        </div>
      </div>

      {tab === 'campaigns' && <CampaignsList campaigns={DEMO_CAMPAIGNS} />}
      {tab === 'reviews' && <ReviewsList reviews={DEMO_REVIEWS} />}
      {tab === 'referrals' && <ReferralsView />}
    </div>
  );
}

function CampaignsList({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'auto' }}>
      <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Campaign</th>
            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Type</th>
            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '0.6rem', textAlign: 'right' }}>Sent</th>
            <th style={{ padding: '0.6rem', textAlign: 'right' }}>Opened</th>
            <th style={{ padding: '0.6rem', textAlign: 'right' }}>Converted</th>
            <th style={{ padding: '0.6rem', textAlign: 'right' }}>Rate</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map(c => (
            <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '0.5rem 0.6rem', fontWeight: 500 }}>{c.name}</td>
              <td style={{ padding: '0.5rem 0.6rem' }}>{typeIcons[c.type]} {c.type.replace('_', ' ')}</td>
              <td style={{ padding: '0.5rem 0.6rem' }}><span style={{ background: statusColors[c.status] + '22', color: statusColors[c.status], padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{c.status}</span></td>
              <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right' }}>{c.sent}</td>
              <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right' }}>{c.opened}</td>
              <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', fontWeight: 600, color: '#34a853' }}>{c.converted}</td>
              <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right' }}>{c.sent > 0 ? `${Math.round((c.converted / c.sent) * 100)}%` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReviewsList({ reviews }: { reviews: ReviewRequest[] }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'auto' }}>
      <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Customer</th>
            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Platform</th>
            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Rating</th>
            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Sent</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '0.5rem 0.6rem', fontWeight: 500 }}>{r.customer}</td>
              <td style={{ padding: '0.5rem 0.6rem' }}>{platformIcons[r.platform]} {r.platform}</td>
              <td style={{ padding: '0.5rem 0.6rem' }}>{r.status}</td>
              <td style={{ padding: '0.5rem 0.6rem' }}>{r.rating ? '⭐'.repeat(r.rating) : '—'}</td>
              <td style={{ padding: '0.5rem 0.6rem', color: '#5f6368' }}>{r.sentAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReferralsView() {
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Referral Program</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}><p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a73e8' }}>7</p><p style={{ fontSize: '0.8rem', color: '#5f6368' }}>Referrals This Month</p></div>
        <div style={{ textAlign: 'center' }}><p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34a853' }}>$350</p><p style={{ fontSize: '0.8rem', color: '#5f6368' }}>Rewards Issued</p></div>
        <div style={{ textAlign: 'center' }}><p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e67c00' }}>$4,200</p><p style={{ fontSize: '0.8rem', color: '#5f6368' }}>Revenue from Referrals</p></div>
      </div>
      <p style={{ fontSize: '0.9rem', color: '#5f6368' }}>Active program: $50 credit per successful referral. Share link with customers after service completion.</p>
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
