'use client';

import { useState, type FormEvent } from 'react';
import { apiUrl, tenantId } from '@/auth/session';

type Mode = 'forgot' | 'reset' | 'invite';

export function IdentityForm({ mode }: { mode: Mode }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    const data = new FormData(event.currentTarget);
    const token = new URLSearchParams(window.location.search).get('token') || '';
    const endpoint = mode === 'forgot' ? '/auth/password-reset/request' : mode === 'reset' ? '/auth/password-reset/confirm' : '/auth/invitations/accept';
    const payload = mode === 'forgot'
      ? { email: data.get('email') }
      : mode === 'reset'
        ? { token, password: data.get('password') }
        : { token, name: data.get('name'), password: data.get('password') };
    try {
      const response = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-tenant-id': tenantId() },
        body: JSON.stringify(payload)
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || 'Request failed');
      setMessage(mode === 'forgot' ? 'If that account exists, reset instructions are on the way.' : 'Your credentials are ready. You can now sign in.');
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  }
  return <form onSubmit={submit}>{mode === 'forgot' ? <label>Email address<input name="email" type="email" autoComplete="email" required autoFocus /></label> : <>{mode === 'invite' && <label>Full name<input name="name" autoComplete="name" required autoFocus /></label>}<label>New password<input name="password" type="password" autoComplete="new-password" minLength={12} required /></label></>}{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status">{message}</p>}<button className="button button-wide" disabled={busy} type="submit">{busy ? 'Working...' : mode === 'forgot' ? 'Send reset instructions' : 'Set password'}</button></form>;
}
