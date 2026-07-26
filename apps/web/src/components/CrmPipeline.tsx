'use client';

import { useState } from 'react';

type LeadStage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
type LeadSource = 'website' | 'referral' | 'phone' | 'storefront' | 'marketing' | 'walk_in';

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  stage: LeadStage;
  value: number;
  service: string;
  notes: string;
  createdAt: string;
  lastContact: string;
};

const DEMO_LEADS: Lead[] = [
  { id: 'l1', name: 'David Thompson', email: 'david@example.com', phone: '555-0101', source: 'website', stage: 'new', value: 850, service: 'AC Installation', notes: 'Interested in new central air', createdAt: '2026-07-20', lastContact: '' },
  { id: 'l2', name: 'Maria Santos', email: 'maria@corp.com', phone: '555-0202', source: 'referral', stage: 'contacted', value: 2400, service: 'Commercial HVAC', notes: 'Referred by Wilson Corp', createdAt: '2026-07-18', lastContact: '2026-07-22' },
  { id: 'l3', name: 'Robert Kim', email: 'rkim@home.net', phone: '555-0303', source: 'storefront', stage: 'qualified', value: 450, service: 'Plumbing Repair', notes: 'Bathroom remodel estimate', createdAt: '2026-07-15', lastContact: '2026-07-24' },
  { id: 'l4', name: 'Jennifer Walsh', email: 'jw@office.co', phone: '555-0404', source: 'phone', stage: 'proposal', value: 5200, service: 'Full System Replacement', notes: 'Sent proposal 7/23, follow up Friday', createdAt: '2026-07-10', lastContact: '2026-07-23' },
  { id: 'l5', name: 'Tech Solutions Inc', email: 'facility@techsol.com', phone: '555-0505', source: 'marketing', stage: 'qualified', value: 12000, service: 'Maintenance Contract', notes: 'Annual maintenance for 3 buildings', createdAt: '2026-07-12', lastContact: '2026-07-21' },
  { id: 'l6', name: 'Sunrise Cafe', email: 'owner@sunrise.cafe', phone: '555-0606', source: 'walk_in', stage: 'new', value: 300, service: 'Drain Cleaning', notes: 'Kitchen drain backup', createdAt: '2026-07-24', lastContact: '' },
  { id: 'l7', name: 'Patricia Moore', email: 'pat@email.com', phone: '555-0707', source: 'referral', stage: 'won', value: 1800, service: 'Water Heater Install', notes: 'Converted! Install scheduled 7/28', createdAt: '2026-07-05', lastContact: '2026-07-24' },
];

const stages: { key: LeadStage; label: string; color: string }[] = [
  { key: 'new', label: 'New Leads', color: '#9e9e9e' },
  { key: 'contacted', label: 'Contacted', color: '#4285f4' },
  { key: 'qualified', label: 'Qualified', color: '#f9ab00' },
  { key: 'proposal', label: 'Proposal Sent', color: '#e67c00' },
  { key: 'won', label: 'Won', color: '#34a853' },
  { key: 'lost', label: 'Lost', color: '#ea4335' },
];

const sourceIcons: Record<LeadSource, string> = {
  website: '🌐', referral: '🤝', phone: '📞', storefront: '🏪', marketing: '📧', walk_in: '🚶'
};

export function CrmPipeline() {
  const [leads, setLeads] = useState(DEMO_LEADS);
  const [view, setView] = useState<'pipeline' | 'list'>('pipeline');
  const [draggedLead, setDraggedLead] = useState<string | null>(null);

  const activeStages = stages.filter(s => s.key !== 'won' && s.key !== 'lost');
  const totalValue = leads.filter(l => l.stage !== 'lost').reduce((s, l) => s + l.value, 0);
  const wonValue = leads.filter(l => l.stage === 'won').reduce((s, l) => s + l.value, 0);

  function moveLead(leadId: string, newStage: LeadStage) {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
    setDraggedLead(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
        <KpiCard label="Total Pipeline" value={`$${totalValue.toLocaleString()}`} />
        <KpiCard label="Won (This Month)" value={`$${wonValue.toLocaleString()}`} color="#34a853" />
        <KpiCard label="Active Leads" value={String(leads.filter(l => !['won', 'lost'].includes(l.stage)).length)} />
        <KpiCard label="Conversion Rate" value={leads.length ? `${Math.round((leads.filter(l => l.stage === 'won').length / leads.length) * 100)}%` : '0%'} color="#1a73e8" />
      </div>

      {/* View Toggle + Add Lead */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setView('pipeline')} style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: view === 'pipeline' ? 600 : 400, background: view === 'pipeline' ? '#e8f0fe' : 'transparent', color: view === 'pipeline' ? '#1a73e8' : '#5f6368' }}>◻ Pipeline</button>
          <button onClick={() => setView('list')} style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: view === 'list' ? 600 : 400, background: view === 'list' ? '#e8f0fe' : 'transparent', color: view === 'list' ? '#1a73e8' : '#5f6368' }}>☰ List</button>
        </div>
        <button style={{ padding: '0.5rem 1rem', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>+ Add Lead</button>
      </div>

      {view === 'pipeline' && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${activeStages.length}, 1fr)`, gap: '0.75rem', minHeight: '400px' }}>
          {activeStages.map(stage => {
            const stageLeads = leads.filter(l => l.stage === stage.key);
            const stageValue = stageLeads.reduce((s, l) => s + l.value, 0);
            return (
              <div key={stage.key} style={{ background: '#f8f9fa', borderRadius: '8px', padding: '0.75rem', borderTop: `3px solid ${stage.color}` }}
                onDragOver={e => e.preventDefault()} onDrop={() => draggedLead && moveLead(draggedLead, stage.key)}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.8rem', color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stage.label} ({stageLeads.length})</h4>
                  <p style={{ fontSize: '0.75rem', color: stage.color, fontWeight: 600 }}>${stageValue.toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {stageLeads.map(lead => <LeadCard key={lead.id} lead={lead} onDragStart={() => setDraggedLead(lead.id)} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'list' && <LeadListView leads={leads} />}
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: color || '#202124' }}>{value}</p>
      <p style={{ fontSize: '0.75rem', color: '#5f6368' }}>{label}</p>
    </div>
  );
}

function LeadCard({ lead, onDragStart }: { lead: Lead; onDragStart: () => void }) {
  return (
    <div draggable onDragStart={onDragStart} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '0.6rem', cursor: 'grab' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{lead.name}</p>
        <span style={{ fontSize: '0.7rem' }}>{sourceIcons[lead.source]}</span>
      </div>
      <p style={{ fontSize: '0.75rem', color: '#5f6368', marginTop: '0.2rem' }}>{lead.service}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.7rem' }}>
        <span style={{ color: '#34a853', fontWeight: 600 }}>${lead.value.toLocaleString()}</span>
        <span style={{ color: '#9e9e9e' }}>{lead.createdAt}</span>
      </div>
    </div>
  );
}

function LeadListView({ leads }: { leads: Lead[] }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'auto' }}>
      <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Service</th>
            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Source</th>
            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Value</th>
            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Stage</th>
            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Last Contact</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '0.5rem 0.6rem' }}>
                <div><strong>{lead.name}</strong></div>
                <div style={{ fontSize: '0.75rem', color: '#5f6368' }}>{lead.email}</div>
              </td>
              <td style={{ padding: '0.5rem 0.6rem' }}>{lead.service}</td>
              <td style={{ padding: '0.5rem 0.6rem' }}>{sourceIcons[lead.source]} {lead.source}</td>
              <td style={{ padding: '0.5rem 0.6rem', color: '#34a853', fontWeight: 500 }}>${lead.value.toLocaleString()}</td>
              <td style={{ padding: '0.5rem 0.6rem' }}>
                <span style={{ background: (stages.find(s => s.key === lead.stage)?.color || '#9e9e9e') + '22', color: stages.find(s => s.key === lead.stage)?.color, padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                  {stages.find(s => s.key === lead.stage)?.label}
                </span>
              </td>
              <td style={{ padding: '0.5rem 0.6rem', color: '#5f6368' }}>{lead.lastContact || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
