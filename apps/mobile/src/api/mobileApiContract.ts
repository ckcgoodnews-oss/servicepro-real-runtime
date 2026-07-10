export type MobileApiEndpoint = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  authRequired: boolean;
  offlineCapable: boolean;
};

export const MOBILE_API_ENDPOINTS: MobileApiEndpoint[] = [
  { method: 'GET', path: '/mobile/v1/me', authRequired: true, offlineCapable: false },
  { method: 'GET', path: '/mobile/v1/jobs', authRequired: true, offlineCapable: true },
  { method: 'PATCH', path: '/mobile/v1/jobs/:id/status', authRequired: true, offlineCapable: true },
  { method: 'POST', path: '/mobile/v1/uploads', authRequired: true, offlineCapable: true },
  { method: 'POST', path: '/mobile/v1/signatures', authRequired: true, offlineCapable: true },
  { method: 'POST', path: '/mobile/v1/sync/mutations', authRequired: true, offlineCapable: false }
];
