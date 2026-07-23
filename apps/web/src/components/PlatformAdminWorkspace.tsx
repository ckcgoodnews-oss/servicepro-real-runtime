'use client';

import {FormEvent, useCallback, useEffect, useState} from 'react';
import {authFetch} from '@/auth/session';
import {ModuleChecklist} from '@/components/ModuleChecklist';

const availableModules = ['operations', 'crm', 'assets', 'inventory', 'billing', 'analytics', 'knowledge', 'communications', 'marketplace', 'administration'];

type Owner = {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  entitlementId?: string;
  status?: string;
  expiresAt?: string;
  siteTypeItemId?: string;
};
type SiteType = {id:string;name:string;itemType:string;description:string};

export function PlatformAdminWorkspace() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [creating, setCreating] = useState(false);
  const [siteTypes, setSiteTypes] = useState<SiteType[]>([]);

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
    authFetch('/api/v1/app-marketplace').then(response=>response.json()).then(body=>setSiteTypes((body.data||[]).filter((item:SiteType)=>item.itemType==='service_pack'))).catch(()=>setSiteTypes([]));
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

  async function createOwner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const response = await authFetch('/api/v1/platform/owners', {
      method: 'POST',
      body: JSON.stringify({tenantId: form.get('tenantId'), name: form.get('name'), email: form.get('email'), password: form.get('password'), modules: form.getAll('modules'), siteTypeItemId: form.get('siteTypeItemId')})
    });
    const body = await response.json();
    setCreating(false);
    if (!response.ok) { setError(body.error?.message || 'Unable to create owner'); return; }
    event.currentTarget.reset();
    await load();
  }

  async function saveSiteType(owner:Owner,itemId:string){
    const response=await authFetch(`/api/v1/platform/tenants/${owner.tenantId}/site-type`,{method:'PUT',body:JSON.stringify({itemId})});
    if(!response.ok){const body=await response.json();setError(body.error?.message||'Unable to update site type');return;}
    await load();
  }

  return (
    <div className="platform-admin-grid">
    <section className="panel platform-owner-create">
      <div className="panel-heading"><div><h2>Create business owner</h2><p>Create the tenant login, then assign modules and timed access.</p></div></div>
      <form onSubmit={createOwner}>
        <div className="form-columns"><label>Business name<input name="name" required /></label><label>Tenant ID<input name="tenantId" defaultValue="tenant_demo" required /></label></div>
        <label>Owner email<input name="email" type="email" required /></label>
        <label>Temporary password<input name="password" type="password" minLength={12} required /><small>Use uppercase, lowercase, number, and symbol.</small></label>
        <label>Service-company site type<select name="siteTypeItemId" required defaultValue=""><option value="" disabled>Select a marketplace service pack</option>{siteTypes.map(item=><option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
        <fieldset className="platform-module-picker"><legend>Enabled business modules</legend><p>Only platform administrators can change this tenant-wide entitlement.</p><div>{availableModules.map(moduleName=><label key={moduleName}><input type="checkbox" name="modules" value={moduleName} defaultChecked={['operations','crm','assets','billing'].includes(moduleName)} />{moduleName}</label>)}</div></fieldset>
        <button className="button button-small" disabled={creating}>{creating ? 'Creating owner…' : 'Create owner'}</button>
      </form>
    </section>
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
            <label className="owner-site-type">Service-company site type<select value={owner.siteTypeItemId||''} onChange={event=>void saveSiteType(owner,event.target.value)}><option value="" disabled>Select site type</option>{siteTypes.map(item=><option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
          </article>
        ))}
      </div>
    </section>
    </div>
  );
}
