'use client';

import {FormEvent, useCallback, useEffect, useMemo, useState} from 'react';
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
type DashboardTenant = {
  tenantId:string;
  tenantName:string;
  tenantStatus:string;
  totalUsers:number;
  activeUsers:number;
  ownerCount:number;
  subscriptionStatus:string;
  subscriptionPlan:string;
  storageBytes:number;
  storageMetered:boolean;
};
type DashboardData = {
  summary:{
    totalTenants:number;
    activeUsers:number;
    owners:number;
    healthySubscriptions:number;
    storageBytes:number;
    meteredTenants:number;
  };
  tenants:DashboardTenant[];
  generatedAt:string;
};

function formatBytes(value:number){
  if(!value)return '0 B';
  const units=['B','KB','MB','GB','TB'];
  const index=Math.min(Math.floor(Math.log(value)/Math.log(1024)),units.length-1);
  return `${(value/Math.pow(1024,index)).toFixed(index===0?0:1)} ${units[index]}`;
}
function title(value:string){
  return value.replaceAll('_',' ').replace(/\b\w/g,letter=>letter.toUpperCase());
}

export function PlatformAdminWorkspace() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData|null>(null);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [creating, setCreating] = useState(false);
  const [siteTypes, setSiteTypes] = useState<SiteType[]>([]);
  const [search,setSearch]=useState('');

  const load = useCallback(async () => {
    try {
      const [ownersResponse,dashboardResponse]=await Promise.all([
        authFetch('/api/v1/platform/owners'),
        authFetch('/api/v1/platform/tenant-dashboard')
      ]);
      const ownersBody=await ownersResponse.json();
      const dashboardBody=await dashboardResponse.json();
      if(!ownersResponse.ok)throw new Error(ownersBody.error?.message||'Owner request failed');
      if(!dashboardResponse.ok)throw new Error(dashboardBody.error?.message||'Dashboard request failed');
      setOwners(ownersBody.data||[]);
      setDashboard(dashboardBody.data);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Request failed');
    }
  }, []);

  useEffect(() => {
    void load();
    authFetch('/api/v1/app-marketplace').then(response=>response.json()).then(body=>setSiteTypes((body.data||[]).filter((item:SiteType)=>item.itemType==='service_pack'))).catch(()=>setSiteTypes([]));
  }, [load]);

  const filteredTenants=useMemo(()=>{
    const query=search.trim().toLowerCase();
    if(!query)return dashboard?.tenants||[];
    return (dashboard?.tenants||[]).filter(row=>
      row.tenantName.toLowerCase().includes(query)||
      row.tenantId.toLowerCase().includes(query)||
      row.subscriptionStatus.toLowerCase().includes(query)||
      row.subscriptionPlan.toLowerCase().includes(query)
    );
  },[dashboard,search]);

  async function issue(event: FormEvent<HTMLFormElement>, owner: Owner) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await authFetch(`/api/v1/platform/owners/${owner.id}/token`, {
      method: 'POST',
      body: JSON.stringify({tenantId: owner.tenantId, days: Number(form.get('days'))})
    });
    const body = await response.json();
    if (!response.ok) { setError(body.error?.message || 'Issue failed'); return; }
    setToken(body.data.token);
    await load();
  }

  async function change(owner: Owner, status?: string, days?: number) {
    if (!owner.entitlementId) return;
    const body: Record<string, string> = {};
    if (status) body.status = status;
    if (days) body.expiresAt = new Date(Date.now() + days * 86_400_000).toISOString();
    const response = await authFetch(`/api/v1/platform/entitlements/${owner.entitlementId}`, {
      method: 'PATCH', body: JSON.stringify(body)
    });
    if (!response.ok) { setError('Update failed'); return; }
    await load();
  }

  async function createOwner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true); setError('');
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

  const summary=dashboard?.summary;

  return (
    <div className="platform-admin-grid">
      <section className="tenant-command-center">
        <div className="panel-heading">
          <div><h2>Tenant Management Center</h2><p>Platform-wide tenant, user, ownership, subscription, and storage posture.</p></div>
          <button className="button button-small" onClick={()=>void load()}>Refresh</button>
        </div>
        {error&&<p className="form-error">{error}</p>}
        <div className="tenant-summary-cards">
          <article><small>Total tenants</small><strong>{summary?.totalTenants??'—'}</strong><span>Registered workspaces</span></article>
          <article><small>Active users</small><strong>{summary?.activeUsers??'—'}</strong><span>Enabled tenant accounts</span></article>
          <article><small>Owners</small><strong>{summary?.owners??'—'}</strong><span>Tenant owner assignments</span></article>
          <article><small>Subscription status</small><strong>{summary?`${summary.healthySubscriptions}/${summary.totalTenants}`:'—'}</strong><span>Active or trial subscriptions</span></article>
          <article><small>Storage usage</small><strong>{summary?formatBytes(summary.storageBytes):'—'}</strong><span>{summary?.meteredTenants??0} tenant(s) metered</span></article>
        </div>
        <div className="tenant-dashboard-toolbar">
          <label>Search tenants<input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Name, tenant ID, plan, or status" /></label>
          <small>{dashboard?.generatedAt?`Updated ${new Date(dashboard.generatedAt).toLocaleString()}`:''}</small>
        </div>
        <div className="tenant-dashboard-table-wrap">
          <table className="tenant-dashboard-table">
            <thead><tr><th>Tenant</th><th>Users</th><th>Owners</th><th>Subscription</th><th>Storage</th><th>Tenant status</th></tr></thead>
            <tbody>
              {filteredTenants.map(row=><tr key={row.tenantId}>
                <td><strong>{row.tenantName}</strong><small>{row.tenantId}</small></td>
                <td><strong>{row.activeUsers}</strong><small>{row.totalUsers} total</small></td>
                <td>{row.ownerCount}</td>
                <td><span className={`status-pill status-${row.subscriptionStatus}`}>{title(row.subscriptionStatus)}</span><small>{row.subscriptionPlan}</small></td>
                <td>{row.storageMetered?formatBytes(row.storageBytes):<span className="not-metered">Not metered</span>}</td>
                <td><span className={`status-pill status-${row.tenantStatus}`}>{title(row.tenantStatus)}</span></td>
              </tr>)}
              {!filteredTenants.length&&<tr><td colSpan={6} className="tenant-empty">No tenants match this search.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

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
        <div className="panel-heading"><div><h2>Owner access</h2><p>Issue one-time activation tokens and control application access.</p></div></div>
        {token&&<div className="token-reveal"><code>{token}</code><button onClick={()=>navigator.clipboard.writeText(token)}>Copy token</button><small>Shown once. Send it securely.</small></div>}
        <div className="organization-list">
          {owners.map(owner=><article key={owner.id}>
            <span><strong>{owner.name||owner.email}</strong><small>{owner.email} · {owner.tenantId} · {owner.status||'Unmanaged'}{owner.expiresAt?` · expires ${new Date(owner.expiresAt).toLocaleDateString()}`:''}</small></span>
            <form onSubmit={event=>issue(event,owner)}><input name="days" type="number" min="1" max="3650" defaultValue="30" /><button className="button button-small">Issue token</button></form>
            {owner.entitlementId&&<span><button onClick={()=>change(owner,'suspended')}>Suspend</button><button onClick={()=>change(owner,'revoked')}>Revoke</button><button onClick={()=>change(owner,'active',30)}>Extend 30 days</button></span>}
            <details><summary>Enabled modules</summary><ModuleChecklist tenantId={owner.tenantId} /></details>
            <label className="owner-site-type">Service-company site type<select value={owner.siteTypeItemId||''} onChange={event=>void saveSiteType(owner,event.target.value)}><option value="" disabled>Select site type</option>{siteTypes.map(item=><option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
          </article>)}
        </div>
      </section>
    </div>
  );
}
