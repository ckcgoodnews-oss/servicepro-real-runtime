'use client';

import { useRouter } from 'next/navigation';
import { authFetch, clearSession } from '@/auth/session';

export function LogoutButton() {
  const router = useRouter();
  async function logout() { try { await authFetch('/auth/logout', { method:'POST' }); } finally { clearSession(); router.replace('/login'); } }
  return <button className="sidebar-link" type="button" onClick={logout}><span>↪</span>Sign out</button>;
}
