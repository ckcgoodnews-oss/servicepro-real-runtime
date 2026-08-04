'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { authFetch } from '@/auth/session';
import Link from 'next/link';

interface SiteData {
  hasSite: boolean;
  siteId?: string;
  slug?: string;
  publicUrl?: string;
  provisioningState?: string;
  trialStatus?: string;
  content?: Record<string, string>;
  version?: number;
  allowedEditFields?: string[];
}

interface Lead {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

export function TrialSiteDashboard() {
  const [site, setSite] = useState<SiteData | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [edits, setEdits] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      authFetch('/api/v1/trial/site').then(r => r.json()),
      authFetch('/api/v1/trial/site/leads').then(r => r.json())
    ]).then(([siteBody, leadsBody]) => {
      if (siteBody.data) setSite(siteBody.data);
      if (leadsBody.data?.leads) setLeads(leadsBody.data.leads);
    }).finally(() => setLoading(false));
  }, []);

  function handleEdit(field: string, value: string) {
    setEdits(prev => ({ ...prev, [field]: value }));
  }

  async function saveEdits(e: FormEvent) {
    e.preventDefault();
    if (Object.keys(edits).length === 0) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await authFetch('/api/v1/trial/site', {
        method: 'PATCH',
        body: JSON.stringify(edits)
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message || 'Save failed');
      setSaveMsg(`Saved ${body.data?.applied?.length || 0} field(s)`);
      setEdits({});
      // Refresh site data
      const refreshed = await authFetch('/api/v1/trial/site').then(r => r.json());
      if (refreshed.data) setSite(refreshed.data);
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="dashboard-loading">Loading your site...</div>;
  if (!site?.hasSite) return (
    <div className="panel">
      <h2>No site yet</h2>
      <p>Choose your service packs to generate your website.</p>
      <Link href="/trial-select" className="button">Choose services</Link>
    </div>
  );

  const isExpired = site.trialStatus === 'expired';
  const content: Record<string, unknown> = site.content || {};
  const fieldStates = (content.fieldStates || {}) as Record<string, string>;
  const allowed = new Set(site.allowedEditFields || []);

  return (
    <div className="trial-site-dashboard">
      <div className="site-status-bar">
        <div>
          <strong>{String(content.companyName || 'Your site')}</strong>
          <span className={`status-badge status-${site.provisioningState}`}>{site.provisioningState}</span>
        </div>
        {site.publicUrl && (
          <a href={site.publicUrl} target="_blank" rel="noopener noreferrer" className="button button-small">
            View live site ↗
          </a>
        )}
      </div>

      {isExpired && (
        <div className="trial-banner trial-banner-urgent">
          <strong>Your trial has ended.</strong>
          <Link href="/settings/upgrade" className="button button-small">Upgrade now</Link>
        </div>
      )}

      <div className="site-panels">
        <form className="panel site-editor" onSubmit={saveEdits}>
          <div className="panel-heading">
            <h2>Edit your site</h2>
            {saveMsg && <span className="form-success">{saveMsg}</span>}
          </div>

          {[...allowed].map(field => (
            <label key={field} className="edit-field">
              <span className="field-label">
                {field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                {fieldStates[field] === 'user-edited' && <em className="edited-badge">edited</em>}
              </span>
              <input
                value={edits[field] ?? String(content[field] ?? '')}
                onChange={e => handleEdit(field, e.target.value)}
                disabled={isExpired}
                maxLength={500}
              />
            </label>
          ))}

          <button className="button" type="submit" disabled={saving || isExpired || Object.keys(edits).length === 0}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>

        <div className="panel site-leads">
          <div className="panel-heading">
            <h2>Leads</h2>
            <span className="muted">{leads.length} total</span>
          </div>
          {leads.length === 0 ? (
            <p className="empty-state">No leads yet. Share your site URL to start receiving requests.</p>
          ) : (
            <ul className="lead-list">
              {leads.map(lead => (
                <li key={lead.id}>
                  <strong>{lead.title}</strong>
                  <span className="muted">{new Date(lead.createdAt).toLocaleDateString()}</span>
                  <span className={`status-badge status-${lead.status}`}>{lead.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
