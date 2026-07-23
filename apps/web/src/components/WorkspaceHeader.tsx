'use client';

import { useEffect, useMemo, useState } from 'react';
import { authFetch, setActiveTenantId, tenantId } from '@/auth/session';

type Workspace = { id: string; tenantId: string; name: string };

export function WorkspaceHeader({ platformAdmin }: { platformAdmin: boolean }) {
  const [current, setCurrent] = useState<Workspace | null>(null);
  const [options, setOptions] = useState<Workspace[]>([]);
  const [query, setQuery] = useState('');
  const [switching, setSwitching] = useState(false);

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
    const response = await authFetch('/api/admin/switch-tenant', { method: 'POST', body: JSON.stringify({ tenantId: nextTenantId }) });
    setSwitching(false);
    if (!response.ok) return;
    setActiveTenantId(nextTenantId);
    window.location.reload();
  }

  if (!platformAdmin) {
    return <div className="workspace-static-label"><span>Workspace</span><strong>{current?.name || 'Current business'}</strong></div>;
  }

  return <div className="workspace-selector">
    <span>Active workspace</span>
    <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search businesses" aria-label="Search business workspaces" />
    <select value={current?.tenantId || tenantId()} disabled={switching} onChange={event => void switchWorkspace(event.target.value)} aria-label="Switch active workspace">
      {filtered.map(workspace => <option value={workspace.tenantId} key={workspace.id}>{workspace.name} · {workspace.tenantId}</option>)}
    </select>
  </div>;
}
