'use client';

import { useState, useEffect, useMemo } from 'react';
import { dealsApi } from '@/lib/api';

type Deal = {
  id: string;
  name: string;
  stage: string;
  amount: number;
  currency: string;
  ownerId: string | null;
  status: string;
  expectedCloseDate: string | null;
  probability: number | null;
  source: string | null;
  contactId: string | null;
  companyId: string | null;
  createdAt: string;
  updatedAt: string;
};

type Pipeline = { id: string; name: string; stages: { id: string; name: string; probability: number }[] };

const defaultStages = [
  { id: 'new', name: 'New', color: '#9e9e9e' },
  { id: 'qualified', name: 'Qualified', color: '#4285f4' },
  { id: 'proposal', name: 'Proposal', color: '#f9ab00' },
  { id: 'negotiation', name: 'Negotiation', color: '#e67c00' },
  { id: 'closed_won', name: 'Won', color: '#34a853' },
  { id: 'closed_lost', name: 'Lost', color: '#ea4335' },
];

export function DealsWorkspace() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'pipeline' | 'list' | 'forecast'>('pipeline');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', amount: '', stage: 'new', source: '', expected_close_date: '' });

  useEffect(() => {
    Promise.all([
      dealsApi.list().then(r => r.data || []),
      dealsApi.listPipelines().then(r => r.data || []),
    ]).then(([d, p]) => { setDeals(d as Deal[]); setPipelines(p as Pipeline[]); })
      .finally(() => setLoading(false));
  }, []);

  const stages = useMemo(() => {
    if (pipelines.length && pipelines[0].stages?.length) {
      return pipelines[0].stages.map((s: any) => ({ id: s.id, name: s.name, color: '#579bfc' }));
    }
    return defaultStages;
  }, [pipelines]);

  const dealsByStage = useMemo(() => {
    const map: Record<string, Deal[]> = {};
    for (const s of stages) map[s.id] = [];
    for (const d of deals) {
      const key = d.status === 'won' ? 'closed_won' : d.status === 'lost' ? 'closed_lost' : d.stage;
      if (map[key]) map[key].push(d);
      else if (map[d.stage]) map[d.stage].push(d);
    }
    return map;
  }, [deals, stages]);

  const forecast = useMemo(() => {
    const open = deals.filter(d => d.status === 'open');
    const won = deals.filter(d => d.status === 'won');
    return {
      pipeline: open.reduce((sum, d) => sum + (d.amount || 0), 0),
      weighted: open.reduce((sum, d) => sum + (d.amount || 0) * ((d.probability || 50) / 100), 0),
      won: won.reduce((sum, d) => sum + (d.amount || 0), 0),
      count: open.length,
      wonCount: won.length,
    };
  }, [deals]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const result = await dealsApi.create({ ...form, amount: parseFloat(form.amount) || 0 });
    if (result.data) { setDeals(prev => [result.data as Deal, ...prev]); setShowCreate(false); setForm({ name: '', amount: '', stage: 'new', source: '', expected_close_date: '' }); }
  }

  async function handleStageChange(dealId: string, newStage: string) {
    const status = newStage === 'closed_won' ? 'won' : newStage === 'closed_lost' ? 'lost' : 'open';
    const result = await dealsApi.update(dealId, { stage: newStage, status });
    if (result.data) setDeals(prev => prev.map(d => d.id === dealId ? { ...d, ...result.data as Deal } : d));
  }

  if (loading) return <div className="workspace-loading" aria-busy="true"><p>Loading deals...</p></div>;

  return (
    <div className="deals-workspace">
      <header className="workspace-header">
        <h1>Deals</h1>
        <div className="workspace-actions">
          <button className="btn-tab" data-active={view === 'pipeline'} onClick={() => setView('pipeline')}>Pipeline</button>
          <button className="btn-tab" data-active={view === 'list'} onClick={() => setView('list')}>List</button>
          <button className="btn-tab" data-active={view === 'forecast'} onClick={() => setView('forecast')}>Forecast</button>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>+ New Deal</button>
        </div>
      </header>

      {/* Forecast Summary Bar */}
      <div className="deals-forecast-bar" role="region" aria-label="Pipeline summary">
        <div className="forecast-metric"><span className="metric-value">${forecast.pipeline.toLocaleString()}</span><span className="metric-label">Pipeline ({forecast.count})</span></div>
        <div className="forecast-metric"><span className="metric-value">${forecast.weighted.toLocaleString()}</span><span className="metric-label">Weighted</span></div>
        <div className="forecast-metric"><span className="metric-value">${forecast.won.toLocaleString()}</span><span className="metric-label">Won ({forecast.wonCount})</span></div>
      </div>

      {/* Pipeline View (Kanban) */}
      {view === 'pipeline' && (
        <div className="deals-pipeline" role="region" aria-label="Deal pipeline board">
          {stages.map(stage => (
            <div key={stage.id} className="pipeline-column" onDragOver={e => e.preventDefault()} onDrop={() => {}}>
              <div className="pipeline-column-header" style={{ borderTopColor: stage.color }}>
                <h3>{stage.name}</h3>
                <span className="deal-count">{(dealsByStage[stage.id] || []).length}</span>
              </div>
              <div className="pipeline-cards">
                {(dealsByStage[stage.id] || []).map(deal => (
                  <article key={deal.id} className="deal-card" draggable>
                    <h4>{deal.name}</h4>
                    <div className="deal-amount">${(deal.amount || 0).toLocaleString()}</div>
                    {deal.expectedCloseDate && <div className="deal-close-date">Close: {deal.expectedCloseDate}</div>}
                    {deal.probability != null && <div className="deal-probability">{deal.probability}% likely</div>}
                    <div className="deal-card-actions">
                      <select value={deal.stage} onChange={e => handleStageChange(deal.id, e.target.value)} aria-label={`Change stage for ${deal.name}`}>
                        {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <table className="data-table" role="grid" aria-label="Deals list">
          <thead><tr><th>Name</th><th>Stage</th><th>Amount</th><th>Close Date</th><th>Probability</th><th>Status</th></tr></thead>
          <tbody>
            {deals.map(deal => (
              <tr key={deal.id}>
                <td><strong>{deal.name}</strong></td>
                <td>{deal.stage}</td>
                <td>${(deal.amount || 0).toLocaleString()}</td>
                <td>{deal.expectedCloseDate || '—'}</td>
                <td>{deal.probability != null ? `${deal.probability}%` : '—'}</td>
                <td><span className={`status-badge status-${deal.status}`}>{deal.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Forecast View */}
      {view === 'forecast' && (
        <div className="forecast-view" role="region" aria-label="Revenue forecast">
          <div className="forecast-grid">
            {stages.filter(s => !s.id.startsWith('closed')).map(stage => {
              const stageDeals = dealsByStage[stage.id] || [];
              const total = stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
              const weighted = stageDeals.reduce((sum, d) => sum + (d.amount || 0) * ((d.probability || 50) / 100), 0);
              return (
                <div key={stage.id} className="forecast-stage-card">
                  <h3>{stage.name}</h3>
                  <div className="forecast-stage-total">${total.toLocaleString()}</div>
                  <div className="forecast-stage-weighted">Weighted: ${weighted.toLocaleString()}</div>
                  <div className="forecast-stage-count">{stageDeals.length} deals</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Deal Modal */}
      {showCreate && (
        <dialog open className="modal" aria-labelledby="create-deal-title">
          <form onSubmit={handleCreate}>
            <h2 id="create-deal-title">New Deal</h2>
            <label>Name <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></label>
            <label>Amount <input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></label>
            <label>Stage <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>{stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
            <label>Source <input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} /></label>
            <label>Expected Close <input type="date" value={form.expected_close_date} onChange={e => setForm(f => ({ ...f, expected_close_date: e.target.value }))} /></label>
            <div className="modal-actions"><button type="submit" className="btn-primary">Create</button><button type="button" onClick={() => setShowCreate(false)}>Cancel</button></div>
          </form>
        </dialog>
      )}
    </div>
  );
}
