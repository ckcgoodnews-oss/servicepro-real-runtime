'use client';

import { useEffect, useMemo, useState } from 'react';
import { authFetch, setActiveTenantId, tenantId } from '@/auth/session';

type Workspace = { id: string; tenantId: string; name: string };

export function WorkspaceHeader({ platformAdmin }: { platformAdmin: boolean }) {
  const [current, setCurrent] = useState<Workspace | null>(null);
  const [options, setOptions] = useState<Workspace[]>([]);
  const [query, setQuery] = useState('');
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState('');

  useEffect(() => {
    authFetch('/api/v1/workspace/current').then(response => response.ok ? response.json() : null)
      .then(body => setCurrent(body?.data || null)).catch(() => setCurrent(null));
  }, [platformAdmin]);

  useEffect(() => {
    if (!platformAdmin) return setOptions([]);
    authFetch('/api/v1/admin/workspaces').then(response => response.ok ? response.json() : null)
      .then(body => setOptions(body?.data || [])).catch(() => setOptions([]));
  }, [platformAdmin]);

  const filtered = useMemo(() => options.filter(workspace =>
    `${workspace.name} ${workspace.tenantId}`.toLowerCase().includes(query.toLowerCase())
  ), [options, query]);

  async function switchWorkspace(nextTenantId: string) {
    if (!nextTenantId || nextTenantId === tenantId()) return;
    setSwitching(true);
    setSwitchError('');
    try {
      const response = await authFetch('/api/admin/switch-tenant', {
        method: 'POST',
        body: JSON.stringify({ tenantId: nextTenantId })
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setSwitchError(body?.error?.message || 'Unable to switch company.');
        return;
      }
      setActiveTenantId(nextTenantId);
      window.location.reload();
    } catch {
      setSwitchError('Unable to reach ServicePro. Please try again.');
    } finally {
      setSwitching(false);
    }
  }

  if (!platformAdmin) {
    return <div className="workspace-static-label"><span>Workspace</span><strong>{current?.name || 'Current business'}</strong></div>;
  }

  async function deleteCurrentWorkspace() {
    const active = current?.tenantId || tenantId();
    if (!active) return;
    if (!confirm(`Permanently delete workspace "${current?.name || active}"? This removes all users, settings, and data for this business. This cannot be undone.`)) return;
    setSwitching(true);
    const response = await authFetch(`/api/v1/admin/workspaces/${encodeURIComponent(active)}`, { method: 'DELETE' });
    setSwitching(false);
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setSwitchError(body?.error?.message || 'Unable to delete workspace.');
      return;
    }
    setOptions(prev => prev.filter(w => w.tenantId !== active));
    // Switch to first remaining workspace or reload
    const remaining = options.filter(w => w.tenantId !== active);
    if (remaining.length) {
      setActiveTenantId(remaining[0].tenantId);
    }
    window.location.reload();
  }

  async function renameCurrentWorkspace() {
    const active = current?.tenantId || tenantId();
    if (!active) return;
    const newName = prompt('Enter new workspace name:', current?.name || '');
    if (!newName || !newName.trim()) return;
    setSwitching(true);
    const response = await authFetch(`/api/v1/admin/workspaces/${encodeURIComponent(active)}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: newName.trim() })
    });
    setSwitching(false);
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setSwitchError(body?.error?.message || 'Unable to rename workspace.');
      return;
    }
    setCurrent(prev => prev ? { ...prev, name: newName.trim() } : prev);
    setOptions(prev => prev.map(w => w.tenantId === active ? { ...w, name: newName.trim() } : w));
  }

  return <div className="workspace-selector">
    <span>Active workspace</span>
    <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search businesses" aria-label="Search business workspaces" />
    <select value={current?.tenantId || tenantId()} disabled={switching} onChange={event => void switchWorkspace(event.target.value)} aria-label="Switch active workspace">
      {filtered.map(workspace => <option value={workspace.tenantId} key={workspace.id}>{workspace.name} · {workspace.tenantId}</option>)}
    </select>
    <button type="button" className="workspace-rename-btn" disabled={switching} onClick={renameCurrentWorkspace} title="Rename this workspace">✏️</button>
    <button type="button" className="workspace-delete-btn" disabled={switching} onClick={deleteCurrentWorkspace} title="Delete this workspace">🗑</button>
    {switchError && <small className="workspace-switch-error" role="alert">{switchError}</small>}
  </div>;
}
