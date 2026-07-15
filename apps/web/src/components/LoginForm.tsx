'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { apiUrl, saveSession, tenantId, type AuthSession } from '@/auth/session';

export function LoginForm() {
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const button = event.currentTarget.querySelector('button[type=submit]') as HTMLButtonElement;
    button.disabled = true;
    button.textContent = 'Signing in...';
    try {
      const response = await fetch(apiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-tenant-id': tenantId() },
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || 'Unable to sign in');
      const session: AuthSession = {
        accessToken: body.data.accessToken,
        refreshToken: body.data.refreshToken,
        user: body.data.user
      };
      saveSession(session, form.get('remember') === 'on');
      router.replace('/dashboard');
    } catch (problem) {
      button.disabled = false;
      button.textContent = 'Sign in';
      window.alert(problem instanceof Error ? problem.message : 'Unable to sign in');
    }
  }
  return <form onSubmit={submit}><label>Email address<input type="email" name="email" autoComplete="email" placeholder="you@company.com" required /></label><label>Password<span className="label-row"><Link href="/forgot-password">Forgot password?</Link></span><input type="password" name="password" autoComplete="current-password" placeholder="Enter your password" required /></label><label className="check-row"><input type="checkbox" name="remember" /> Keep me signed in on this device</label><button className="button button-wide" type="submit">Sign in <span aria-hidden="true">→</span></button></form>;
}
