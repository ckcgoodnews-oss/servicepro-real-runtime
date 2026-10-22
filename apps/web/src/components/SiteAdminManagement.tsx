'use client';

import {FormEvent, useCallback, useEffect, useState} from 'react';
import {authFetch} from '@/auth/session';
import {PasswordInput} from '@/components/PasswordInput';

type Admin = {id:string;tenantId:string;email:string;name:string;protected:boolean};

export function SiteAdminManagement() {
  const [admins,setAdmins] = useState<Admin[]>([]);
  const [error,setError] = useState('');
  const [message,setMessage] = useState('');
  const [busy,setBusy] = useState(false);
  const [resetId,setResetId] = useState('');
  const load = useCallback(async () => {
    const response = await authFetch('/api/v1/platform/site-admins');
    const body = await response.json();
    if (!response.ok) throw new Error(body.error?.message || 'Unable to load site administrators');
    setAdmins(body.data || []);
  },[]);
  useEffect(() => { void load().catch(err => setError(err.message)); },[load]);
  async function change(path:string, method:string, data?:Record<string,unknown>) {
    setBusy(true); setError(''); setMessage('');
    try {
      const response = await authFetch(path,{method,headers:{'Content-Type':'application/json'},body:data ? JSON.stringify(data) : undefined});
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || 'Request failed');
      await load();
      return true;
    } catch (err) { setError(err instanceof Error ? err.message : 'Request failed'); return false; }
    finally { setBusy(false); }
  }
  async function grant(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (await change('/api/v1/platform/site-admins','POST',{email:data.get('email'),name:data.get('name'),password:data.get('password')})) {
      form.reset(); setMessage('Site administrator access granted. Existing company roles and passwords were preserved.');
    }
  }
  async function reset(event:FormEvent<HTMLFormElement>,admin:Admin) {
    event.preventDefault();
    const form = event.currentTarget;
    if (await change(`/api/v1/platform/site-admins/${admin.id}/reset-password`,'POST',{password:new FormData(form).get('password')})) {
      form.reset(); setResetId(''); setMessage('Password updated and all existing sessions signed out.');
    }
  }
  return <section className="panel">
    <h2>Site administrators</h2>
    <p>Site administrators can manage every company, user, module, and site setting. Company administrators only manage their own company.</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    {message && <p role="status">{message}</p>}
    <form onSubmit={grant}>
      <h3>Create or grant a site administrator</h3>
      <label>Email<input name="email" type="email" required autoComplete="off" /></label>
      <label>Name (required for a new account)<input name="name" autoComplete="off" /></label>
      <label>Initial password (required for a new account)<PasswordInput name="password" minLength={12} autoComplete="new-password" /></label>
      <p>Use at least 12 characters with uppercase, lowercase, a number, and a symbol. For an existing account, its password stays unchanged.</p>
      <label><input type="checkbox" required /> I intend to give this account control of the entire site.</label>
      <button className="button" disabled={busy}>Grant site administrator access</button>
    </form>
    <ul>{admins.map(admin => <li key={`${admin.tenantId}:${admin.id}`}>
      <strong>{admin.name || admin.email}</strong> — {admin.email}
      {admin.protected && <span> (protected recovery administrator)</span>}
      <button className="button button-small" disabled={busy} onClick={()=>setResetId(resetId === admin.id ? '' : admin.id)}>Set password</button>
      {!admin.protected && <button className="button button-small" disabled={busy} onClick={async()=>{
        if (window.confirm(`Remove site-wide access for ${admin.email}? Company access will remain.`) && await change(`/api/v1/platform/site-admins/${admin.id}`,'DELETE')) setMessage('Site administrator access removed and existing sessions signed out.');
      }}>Remove site access</button>}
      {resetId === admin.id && <form onSubmit={event=>void reset(event,admin)}>
        <label>New password for {admin.email}<PasswordInput name="password" required minLength={12} autoComplete="new-password" /></label>
        <button className="button button-small" disabled={busy}>Save password and sign out sessions</button>
      </form>}
    </li>)}</ul>
  </section>;
}
