'use client';

import { useState, useEffect } from 'react';
import { aiInsightsApi } from '@/lib/api';

type Insight = {
  id: string;
  entityType: string;
  entityId: string;
  insightType: string;
  title: string;
  summary: string | null;
  confidence: number | null;
  severity: string;
  status: string;
  detail: Record<string, any>;
  createdAt: string;
};

const severityIcons: Record<string, string> = { critical: '🔴', warning: '🟠', info: '🔵' };
const typeLabels: Record<string, string> = { deal_risk: 'Deal Risk', churn_risk: 'Churn Risk', next_action: 'Next Action', ticket_routing: 'Routing', schedule_opt: 'Schedule', anomaly: 'Anomaly' };

export function AiInsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [counts, setCounts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ severity: '', insight_type: '' });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.severity) params.set('severity', filter.severity);
    if (filter.insight_type) params.set('insight_type', filter.insight_type);
    Promise.all([
      aiInsightsApi.list(params.toString()).then(r => (r.data || []) as Insight[]),
      aiInsightsApi.counts().then(r => r.data),
    ]).then(([i, c]) => { setInsights(i); setCounts(c); })
      .finally(() => setLoading(false));
  }, [filter]);

  async function handleDismiss(id: string) {
    await aiInsightsApi.dismiss(id);
    setInsights(prev => prev.filter(i => i.id !== id));
  }

  async function handleActOn(id: string) {
    await aiInsightsApi.actOn(id);
    setInsights(prev => prev.filter(i => i.id !== id));
  }

  async function handleGenerateDeals() {
    setLoading(true);
    await aiInsightsApi.list('').then(r => setInsights((r.data || []) as Insight[]));
    setLoading(false);
  }

  if (loading) return <div className="workspace-loading" aria-busy="true"><p>Loading AI insights...</p></div>;

  return (
    <div className="ai-insights-panel">
      <header className="workspace-header">
        <h1>AI Insights</h1>
        <div className="workspace-actions">
          <button className="btn-secondary" onClick={handleGenerateDeals}>Refresh Insights</button>
        </div>
      </header>

      {/* Summary Counts */}
      {counts && (
        <div className="insights-summary" role="region" aria-label="Insight summary">
          <div className="metric-card"><span className="metric-value">{counts.total}</span><span className="metric-label">Active</span></div>
          <div className="metric-card metric-critical"><span className="metric-value">{counts.bySeverity?.critical || 0}</span><span className="metric-label">Critical</span></div>
          <div className="metric-card metric-warning"><span className="metric-value">{counts.bySeverity?.warning || 0}</span><span className="metric-label">Warning</span></div>
          <div className="metric-card"><span className="metric-value">{counts.bySeverity?.info || 0}</span><span className="metric-label">Info</span></div>
        </div>
      )}

      {/* Filters */}
      <div className="insights-filters">
        <select value={filter.severity} onChange={e => setFilter(f => ({ ...f, severity: e.target.value }))} aria-label="Filter by severity">
          <option value="">All Severities</option>
          <option value="critical">Critical</option><option value="warning">Warning</option><option value="info">Info</option>
        </select>
        <select value={filter.insight_type} onChange={e => setFilter(f => ({ ...f, insight_type: e.target.value }))} aria-label="Filter by type">
          <option value="">All Types</option>
          {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Insights List */}
      <div className="insights-list" role="list" aria-label="Active insights">
        {insights.map(insight => (
          <article key={insight.id} className={`insight-card insight-${insight.severity}`} role="listitem">
            <div className="insight-header">
              <span className="insight-severity">{severityIcons[insight.severity] || '⚪'}</span>
              <span className="insight-type">{typeLabels[insight.insightType] || insight.insightType}</span>
              {insight.confidence != null && <span className="insight-confidence">{Math.round(insight.confidence * 100)}% confidence</span>}
            </div>
            <h3>{insight.title}</h3>
            {insight.summary && <p className="insight-summary">{insight.summary}</p>}
            <div className="insight-meta">
              <span>{insight.entityType} · {new Date(insight.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="insight-actions">
              <button className="btn-small btn-primary" onClick={() => handleActOn(insight.id)}>Act on it</button>
              <button className="btn-small btn-ghost" onClick={() => handleDismiss(insight.id)}>Dismiss</button>
            </div>
          </article>
        ))}
        {insights.length === 0 && <p className="empty-state">No active insights. Your operations are on track! 🎯</p>}
      </div>
    </div>
  );
}
