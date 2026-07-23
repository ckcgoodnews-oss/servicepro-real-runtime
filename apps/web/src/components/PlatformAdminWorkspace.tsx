'use client';

import {FormEvent, useCallback, useEffect, useState} from 'react';
import {authFetch} from '@/auth/session';
import {ModuleChecklist} from '@/components/ModuleChecklist';

type Owner = {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  entitlementId?: string;
  status?: string;
  expiresAt?: string;
};

export function PlatformAdminWorkspace() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await authFetch('/api/v1/platform/owners');
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || 'Request failed');
      setOwners(body.data);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Request failed');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function issue(event: FormEvent<HTMLFormElement>, owner: Owner) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await authFetch(`/api/v1/platform/owners/${owner.id}/token`, {
      method: 'POST',
      body: JSON.stringify({tenantId: owner.tenantId, days: Number(form.get('days'))})
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error?.message || 'Issue failed');
      return;
    }
    setToken(body.data.token);
    await load();
  }

  async function change(owner: Owner, status?: string, days?: number) {
    if (!owner.entitlementId) return;
    const body: Record<string, string> = {};
    if (status) body.status = status;
    if (days) body.expiresAt = new Date(Date.now() + days * 86_400_000).toISOString();
    const response = await authFetch(`/api/v1/platform/entitlements/${owner.entitlementId}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      setError('Update failed');
      return;
    }
    await load();
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Owner access</h2>
          <p>Issue one-time activation tokens and control application access.</p>
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}
      {token && (
        <div className="token-reveal">
          <code>{token}</code>
          <button onClick={() => navigator.clipboard.writeText(token)}>Copy token</button>
          <small>Shown once. Send it securely.</small>
        </div>
      )}
      <div className="organization-list">
        {owners.map(owner => (
          <article key={owner.id}>
            <span>
              <strong>{owner.name || owner.email}</strong>
              <small>
                {owner.email} · {owner.tenantId} · {owner.status || 'Unmanaged'}
                {owner.expiresAt ? ` · expires ${new Date(owner.expiresAt).toLocaleDateString()}` : ''}
              </small>
            </span>
            <form onSubmit={event => issue(event, owner)}>
              <input name="days" type="number" min="1" max="3650" defaultValue="30" />
              <button className="button button-small">Issue token</button>
            </form>
            {owner.entitlementId && (
              <span>
                <button onClick={() => change(owner, 'suspended')}>Suspend</button>
                <button onClick={() => change(owner, 'revoked')}>Revoke</button>
                <button onClick={() => change(owner, 'active', 30)}>Extend 30 days</button>
              </span>
            )}
            <details>
              <summary>Enabled modules</summary>
              <ModuleChecklist tenantId={owner.tenantId} />
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}
