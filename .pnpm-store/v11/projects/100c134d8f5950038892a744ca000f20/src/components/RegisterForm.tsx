'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { apiUrl, saveSession, tenantId, type AuthSession } from '@/auth/session';

export function RegisterForm() {
  const router = useRouter(); const [error,setError] = useState(''); const [busy,setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); const data = new FormData(event.currentTarget);
    try {
      const response = await fetch(apiUrl('/auth/register'), { method:'POST', headers:{'content-type':'application/json','x-tenant-id':tenantId()}, body:JSON.stringify({name:data.get('name'),email:data.get('email'),password:data.get('password')}) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error?.message || 'Registration failed');
      saveSession(body.data as AuthSession, false); router.replace('/dashboard');
    } catch (problem) { setError(problem instanceof Error ? problem.message : 'Registration failed'); } finally { setBusy(false); }
  }
  return <form onSubmit={submit}><label>Full name<input name="name" autoComplete="name" required autoFocus /></label><label>Work email<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="new-password" minLength={12} required /></label><p className="password-hint">Use 12+ characters with uppercase, lowercase, a number, and a symbol.</p>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-wide" disabled={busy} type="submit">{busy ? 'Creating account...' : 'Create account'}</button></form>;
}
