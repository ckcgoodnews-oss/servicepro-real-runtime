'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

type Workflow = {
  id: string;
  name: string;
  description: string;
  trigger: string;
  status: string;
  executionCount: number;
  lastExecutedAt: string;
  steps: Array<{ action: string; config: Record<string, unknown> }>;
};

type TriggerDef = { key: string; label: string; description: string };
type ActionDef = { key: string; label: string; category: string };

export function AutomationBuilder() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [triggers, setTriggers] = useState<TriggerDef[]>([]);
  const [actions, setActions] = useState<ActionDef[]>([]);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [newName, setNewName] = useState('');
  const [newTrigger, setNewTrigger] = useState('manual');
  const [newSteps, setNewSteps] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [wfRes, trRes, acRes] = await Promise.all([
      api<Workflow[]>('GET', '/api/v1/automation/workflows'),
      api<TriggerDef[]>('GET', '/api/v1/automation/triggers'),
      api<ActionDef[]>('GET', '/api/v1/automation/actions')
    ]);
    if (wfRes.data) setWorkflows(wfRes.data);
    if (trRes.data) setTriggers(trRes.data);
    if (acRes.data) setActions(acRes.data);
  }

  async function createWorkflow() {
    if (!newName.trim()) return;
    const result = await api<Workflow>('POST', '/api/v1/automation/workflows', {
      name: newName,
      trigger: newTrigger,
      steps: newSteps.map(action => ({ action, config: {} }))
    });
    if (result.data) {
      setWorkflows(prev => [result.data!, ...prev]);
      setNewName('');
      setNewTrigger('manual');
      setNewSteps([]);
      setView('list');
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    const result = await api<Workflow>('PATCH', `/api/v1/automation/workflows/${id}`, { status: newStatus });
    if (result.data) setWorkflows(prev => prev.map(w => w.id === id ? result.data! : w));
  }

  async function executeWorkflow(id: string) {
    await api('POST', `/api/v1/automation/workflows/${id}/execute`);
    loadData();
  }

  const statusColors: Record<string, string> = { active: '#34a853', draft: '#9e9e9e', paused: '#f9ab00' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
        <StatCard label="Total Workflows" value={String(workflows.length)} color="#1a73e8" />
        <StatCard label="Active" value={String(workflows.filter(w => w.status === 'active').length)} color="#34a853" />
        <StatCard label="Executions" value={String(workflows.reduce((s, w) => s + (w.executionCount || 0), 0))} color="#e67c00" />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setView('list')} style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: view === 'list' ? 600 : 400, background: view === 'list' ? '#e8f0fe' : 'transparent', color: view === 'list' ? '#1a73e8' : '#5f6368' }}>Workflows</button>
          <button onClick={() => setView('create')} style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: view === 'create' ? 600 : 400, background: view === 'create' ? '#e8f0fe' : 'transparent', color: view === 'create' ? '#1a73e8' : '#5f6368' }}>+ Create</button>
        </div>
      </div>

      {view === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {workflows.length === 0 && <p style={{ color: '#5f6368', textAlign: 'center', padding: '2rem' }}>No workflows yet. Create your first automation.</p>}
          {workflows.map(wf => (
            <div key={wf.id} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColors[wf.status] || '#9e9e9e' }} />
                  <strong style={{ fontSize: '0.9rem' }}>{wf.name}</strong>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#5f6368', marginTop: '0.25rem' }}>Trigger: {wf.trigger} • {wf.steps?.length || 0} steps • {wf.executionCount || 0} runs</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => toggleStatus(wf.id, wf.status)} style={{ padding: '0.3rem 0.7rem', border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', background: 'transparent' }}>
                  {wf.status === 'active' ? 'Pause' : 'Activate'}
                </button>
                <button onClick={() => executeWorkflow(wf.id)} style={{ padding: '0.3rem 0.7rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', background: '#1a73e8', color: '#fff' }} disabled={wf.status !== 'active'}>
                  Run
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'create' && (
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>New Workflow</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Name</label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Send invoice when job completes" style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Trigger</label>
              <select value={newTrigger} onChange={e => setNewTrigger(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px' }}>
                {triggers.map(t => <option key={t.key} value={t.key}>{t.label} — {t.description}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Actions (select in order)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {actions.map(a => (
                  <button key={a.key} onClick={() => setNewSteps(prev => [...prev, a.key])} style={{ padding: '0.3rem 0.6rem', border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', background: newSteps.includes(a.key) ? '#e8f0fe' : '#fff' }}>
                    {a.label}
                  </button>
                ))}
              </div>
              {newSteps.length > 0 && (
                <p style={{ fontSize: '0.8rem', color: '#5f6368', marginTop: '0.5rem' }}>Steps: {newSteps.join(' → ')}</p>
              )}
            </div>
            <button onClick={createWorkflow} style={{ padding: '0.6rem 1.2rem', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, alignSelf: 'flex-start' }}>
              Create Workflow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
      <p style={{ fontSize: '1.4rem', fontWeight: 700, color }}>{value}</p>
      <p style={{ fontSize: '0.75rem', color: '#5f6368' }}>{label}</p>
    </div>
  );
}
