// Platform Administration - Route-to-Page Mapping
// Used by the frontend framework to resolve which page component to render.

import type { PlatformNavItem } from './platformAdminRoutes';

export type PlatformPageRoute = {
  path: string;
  page: string;
  section: string;
  breadcrumb: string[];
  apiEndpoints: string[];
};

export const platformPageRoutes: PlatformPageRoute[] = [
  // Dashboard
  {
    path: '/platform',
    page: 'DashboardPage',
    section: 'dashboard',
    breadcrumb: ['Platform Administration', 'Dashboard'],
    apiEndpoints: ['GET /api/v1/platform/tenant-management']
  },

  // Tenant Management
  {
    path: '/platform/tenants',
    page: 'TenantsOverviewPage',
    section: 'tenant-management',
    breadcrumb: ['Platform Administration', 'Tenant Management', 'Overview'],
    apiEndpoints: ['GET /api/v1/platform/tenant-management']
  },
  {
    path: '/platform/tenants/list',
    page: 'TenantsListPage',
    section: 'tenant-management',
    breadcrumb: ['Platform Administration', 'Tenant Management', 'Tenants'],
    apiEndpoints: ['GET /api/v1/platform/tenant-management', 'POST /api/v1/platform/tmc/tenants']
  },
  {
    path: '/platform/tenants/owners',
    page: 'OwnersPage',
    section: 'tenant-management',
    breadcrumb: ['Platform Administration', 'Tenant Management', 'Owners'],
    apiEndpoints: ['GET /api/v1/platform/tenant-management']
  },
  {
    path: '/platform/tenants/domains',
    page: 'DomainsPage',
    section: 'tenant-management',
    breadcrumb: ['Platform Administration', 'Tenant Management', 'Domains'],
    apiEndpoints: ['POST /api/v1/platform/tenant-management/:tenantId/domains']
  },

  {
    path: '/platform/tenants/branding',
    page: 'BrandingPage',
    section: 'tenant-management',
    breadcrumb: ['Platform Administration', 'Tenant Management', 'Branding'],
    apiEndpoints: ['PATCH /api/v1/platform/tmc/:tenantId/branding', 'PATCH /api/v1/platform/tmc/:tenantId/white-label']
  },
  {
    path: '/platform/tenants/storage',
    page: 'StoragePage',
    section: 'tenant-management',
    breadcrumb: ['Platform Administration', 'Tenant Management', 'Storage'],
    apiEndpoints: ['GET /api/v1/platform/tmc/:tenantId/usage']
  },
  {
    path: '/platform/tenants/statistics',
    page: 'StatisticsPage',
    section: 'tenant-management',
    breadcrumb: ['Platform Administration', 'Tenant Management', 'Statistics'],
    apiEndpoints: ['GET /api/v1/platform/tmc/:tenantId/usage']
  },

  // Subscription Management
  {
    path: '/platform/subscriptions',
    page: 'PlansPage',
    section: 'subscription-management',
    breadcrumb: ['Platform Administration', 'Subscription Management', 'Plans'],
    apiEndpoints: ['PATCH /api/v1/platform/tmc/:tenantId/subscription']
  },
  {
    path: '/platform/subscriptions/billing',
    page: 'BillingPage',
    section: 'subscription-management',
    breadcrumb: ['Platform Administration', 'Subscription Management', 'Billing'],
    apiEndpoints: ['GET /api/v1/platform/tmc/:tenantId/billing/events', 'POST /api/v1/platform/tmc/:tenantId/billing/events']
  },
  {
    path: '/platform/subscriptions/licenses',
    page: 'LicensesPage',
    section: 'subscription-management',
    breadcrumb: ['Platform Administration', 'Subscription Management', 'Licenses'],
    apiEndpoints: ['PATCH /api/v1/platform/tmc/:tenantId/subscription']
  },
  {
    path: '/platform/subscriptions/feature-flags',
    page: 'FeatureFlagsPage',
    section: 'subscription-management',
    breadcrumb: ['Platform Administration', 'Subscription Management', 'Feature Flags'],
    apiEndpoints: ['GET /api/v1/platform/tmc/:tenantId/modules', 'PUT /api/v1/platform/tmc/:tenantId/modules/:moduleKey']
  },

  // Security
  {
    path: '/platform/security/api-keys',
    page: 'ApiKeysPage',
    section: 'security',
    breadcrumb: ['Platform Administration', 'Security', 'API Keys'],
    apiEndpoints: ['POST /api/v1/platform/tenant-management/:tenantId/api-keys', 'POST /api/v1/platform/tenant-management/:tenantId/api-keys/:keyId/revoke']
  },
  {
    path: '/platform/security/oauth',
    page: 'OAuthPage',
    section: 'security',
    breadcrumb: ['Platform Administration', 'Security', 'OAuth'],
    apiEndpoints: ['GET /api/v1/platform/tmc/:tenantId/oauth-clients', 'POST /api/v1/platform/tmc/:tenantId/oauth-clients']
  },

  {
    path: '/platform/security/sessions',
    page: 'SessionsPage',
    section: 'security',
    breadcrumb: ['Platform Administration', 'Security', 'Sessions'],
    apiEndpoints: ['GET /api/v1/platform/tmc/impersonation/sessions', 'POST /api/v1/platform/tmc/impersonation/sessions/:id/end']
  },
  {
    path: '/platform/security/impersonation',
    page: 'ImpersonationPage',
    section: 'security',
    breadcrumb: ['Platform Administration', 'Security', 'Impersonation'],
    apiEndpoints: ['POST /api/v1/platform/tmc/:tenantId/impersonation/owners/:ownerId/start']
  },

  // Monitoring
  {
    path: '/platform/monitoring/health',
    page: 'HealthPage',
    section: 'monitoring',
    breadcrumb: ['Platform Administration', 'Monitoring', 'Health'],
    apiEndpoints: ['GET /api/v1/platform/tmc/:tenantId/health']
  },
  {
    path: '/platform/monitoring/metrics',
    page: 'MetricsPage',
    section: 'monitoring',
    breadcrumb: ['Platform Administration', 'Monitoring', 'Metrics'],
    apiEndpoints: ['GET /api/v1/platform/tmc/:tenantId/usage']
  },

  // Audit
  {
    path: '/platform/audit/logs',
    page: 'LogsPage',
    section: 'audit',
    breadcrumb: ['Platform Administration', 'Audit', 'Logs'],
    apiEndpoints: ['GET /api/v1/platform/tmc/:tenantId/audit', 'POST /api/v1/platform/tmc/:tenantId/audit/export']
  },

  // Recovery
  {
    path: '/platform/recovery/archived-tenants',
    page: 'ArchivedTenantsPage',
    section: 'recovery',
    breadcrumb: ['Platform Administration', 'Recovery', 'Archived Tenants'],
    apiEndpoints: ['GET /api/v1/platform/tmc/recovery/tenants']
  },
  {
    path: '/platform/recovery/deleted-owners',
    page: 'DeletedOwnersPage',
    section: 'recovery',
    breadcrumb: ['Platform Administration', 'Recovery', 'Deleted Owners'],
    apiEndpoints: ['GET /api/v1/platform/tmc/:tenantId/deleted-owners']
  },
  {
    path: '/platform/recovery/restore',
    page: 'RestorePage',
    section: 'recovery',
    breadcrumb: ['Platform Administration', 'Recovery', 'Restore'],
    apiEndpoints: ['POST /api/v1/platform/tenant-management/:tenantId/restore', 'POST /api/v1/platform/tenant-management/:tenantId/owners/:ownerId/restore']
  }
];

export function resolvePlatformRoute(path: string): PlatformPageRoute | undefined {
  return platformPageRoutes.find(route => route.path === path);
}

export function getBreadcrumb(path: string): string[] {
  return resolvePlatformRoute(path)?.breadcrumb || ['Platform Administration'];
}
