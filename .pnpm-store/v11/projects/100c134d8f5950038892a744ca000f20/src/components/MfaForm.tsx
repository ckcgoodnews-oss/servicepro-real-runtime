'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { apiUrl, saveSession, tenantId, type AuthSession } from '@/auth/session';

export function MfaForm() {
  const router = useRouter(); const params = useSearchParams(); const [error,setError] = useState(''); const [busy,setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const code = new FormData(event.currentTarget).get('code');
    const pending = JSON.parse(window.sessionStorage.getItem('servicepro.auth.pendingMfa') || '{}');
    const challengeId = params.get('challenge') || pending.challengeId;
    try {
      const response = await fetch(apiUrl('/auth/mfa/verify'), { method:'POST', headers:{'content-type':'application/json','x-tenant-id':tenantId()}, body:JSON.stringify({challengeId,code}) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error?.message || 'Verification failed');
      saveSession(body.data as AuthSession, false); window.sessionStorage.removeItem('servicepro.auth.pendingMfa'); router.replace('/dashboard');
    } catch (problem) { setError(problem instanceof Error ? problem.message : 'Verification failed'); } finally { setBusy(false); }
  }
  return <form onSubmit={submit}><label>Six-digit verification code<input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required autoFocus /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-wide" disabled={busy} type="submit">{busy ? 'Verifying...' : 'Verify and continue'}</button></form>;
}
