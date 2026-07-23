export type AuthUser = {
  id?: string;
  userId?: string;
  tenantId: string;
  email: string;
  name?: string;
  roles: string[];
  permissions: string[];
};

export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
};

const sessionKey = 'servicepro.auth.session';
const tenantKey = 'servicepro.auth.tenant';
const activeWorkspaceKey = 'servicepro.active.workspace';

export function configuredTenantId() {
  return process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'tenant_demo';
}

export function apiUrl(path: string) {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:10001').replace(/\/$/, '');
  return `${base}${path}`;
}

export function tenantId() {
  if (typeof window === 'undefined') return configuredTenantId();
  return window.localStorage.getItem(activeWorkspaceKey) || window.localStorage.getItem(tenantKey) || configuredTenantId();
}

export function setActiveTenantId(value: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(activeWorkspaceKey, value);
  window.dispatchEvent(new Event('servicepro:workspace'));
}

export function readSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(sessionKey) || window.localStorage.getItem(sessionKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    clearSession();
    return null;
  }
}

export function saveSession(session: AuthSession, remember: boolean) {
  clearSession();
  const storage = remember ? window.localStorage : window.sessionStorage;
  storage.setItem(sessionKey, JSON.stringify(session));
  window.localStorage.setItem(tenantKey, session.user.tenantId || tenantId());
  if (!window.localStorage.getItem(activeWorkspaceKey)) window.localStorage.setItem(activeWorkspaceKey, session.user.tenantId);
  window.dispatchEvent(new Event('servicepro:session'));
}

export function updateSessionUser(patch: Partial<AuthUser>) {
  const session = readSession(); if (!session) return;
  const remembered = window.localStorage.getItem(sessionKey) !== null;
  saveSession({ ...session, user: { ...session.user, ...patch } }, remembered);
}

async function refreshSession(session: AuthSession) {
  if (!session.refreshToken) return null;
  const response = await fetch(apiUrl('/auth/refresh'), { method: 'POST', headers: { 'content-type': 'application/json', 'x-tenant-id': session.user.tenantId }, body: JSON.stringify({ refreshToken: session.refreshToken }) });
  if (!response.ok) return null;
  const body = await response.json();
  const remembered = window.localStorage.getItem(sessionKey) !== null;
  saveSession(body.data as AuthSession, remembered);
  return body.data as AuthSession;
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(sessionKey);
  window.sessionStorage.removeItem(sessionKey);
  window.localStorage.removeItem(tenantKey);
  window.localStorage.removeItem(activeWorkspaceKey);
}

export async function authFetch(path: string, init: RequestInit = {}) {
  const session = readSession();
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json');
  headers.set('x-tenant-id', session?.user.tenantId || tenantId());
  if (session?.accessToken) headers.set('authorization', `Bearer ${session.accessToken}`);
  let response = await fetch(apiUrl(path), { ...init, headers });
  if (response.status === 401 && session?.refreshToken && path !== '/auth/refresh') {
    const refreshed = await refreshSession(session);
    if (refreshed) {
      headers.set('authorization', `Bearer ${refreshed.accessToken}`);
      response = await fetch(apiUrl(path), { ...init, headers });
    }
  }
  return response;
}
