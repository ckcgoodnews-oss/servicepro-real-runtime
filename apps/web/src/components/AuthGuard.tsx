'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { authFetch, clearSession, readSession } from '@/auth/session';

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!readSession()) {
      router.replace('/login?returnTo=/dashboard');
      return;
    }
    authFetch('/api/v1/me').then(response => {
      if (response.status === 402) { router.replace('/activate-access'); return; }
      if (!response.ok) throw new Error('Session expired');
      setReady(true);
    }).catch(() => {
      clearSession();
      router.replace('/login?expired=1');
    });
  }, [router]);
  if (!ready) return <main className="session-loading" aria-live="polite">Verifying secure session...</main>;
  return children;
}
