// ============================================================
// Platform Administration - Complete Navigation Structure
// Enterprise Service Business Operating Platform - Control Center
// ============================================================

export type PlatformNavItem = {
  path: string;
  label: string;
  section: string;
  parent?: string;
  icon?: string;
  badge?: string;
};

export type PlatformNavSection = {
  key: string;
  label: string;
  icon: string;
  items: PlatformNavItem[];
};

// ---- Top-level Dashboard ----
export const platformDashboardRoute: PlatformNavItem = {
  path: '/platform',
  label: 'Dashboard',
  section: 'dashboard',
  icon: 'command-center'
};

// ---- Tenant Management ----
export const tenantManagementRoutes: PlatformNavSection = {
  key: 'tenant-management',
  label: 'Tenant Management',
  icon: 'tenants',
  items: [
    { path: '/platform/tenants', label: 'Overview', section: 'tenant-management' },
    { path: '/platform/tenants/list', label: 'Tenants', section: 'tenant-management' },
    { path: '/platform/tenants/owners', label: 'Owners', section: 'tenant-management' },
    { path: '/platform/tenants/domains', label: 'Domains', section: 'tenant-management' },
    { path: '/platform/tenants/branding', label: 'Branding', section: 'tenant-management' },
    { path: '/platform/tenants/storage', label: 'Storage', section: 'tenant-management' },
    { path: '/platform/tenants/statistics', label: 'Statistics', section: 'tenant-management' }
  ]
};

// ---- Subscription Management ----
export const subscriptionManagementRoutes: PlatformNavSection = {
  key: 'subscription-management',
  label: 'Subscription Management',
  icon: 'credit-card',
  items: [
    { path: '/platform/subscriptions', label: 'Plans', section: 'subscription-management' },
    { path: '/platform/subscriptions/billing', label: 'Billing', section: 'subscription-management' },
    { path: '/platform/subscriptions/licenses', label: 'Licenses', section: 'subscription-management' },
    { path: '/platform/subscriptions/feature-flags', label: 'Feature Flags', section: 'subscription-management' }
  ]
};

// ---- Security ----
export const securityRoutes: PlatformNavSection = {
  key: 'security',
  label: 'Security',
  icon: 'shield',
  items: [
    { path: '/platform/security/api-keys', label: 'API Keys', section: 'security' },
    { path: '/platform/security/oauth', label: 'OAuth', section: 'security' },
    { path: '/platform/security/sessions', label: 'Sessions', section: 'security' },
    { path: '/platform/security/impersonation', label: 'Impersonation', section: 'security' }
  ]
};

// ---- Monitoring ----
export const monitoringRoutes: PlatformNavSection = {
  key: 'monitoring',
  label: 'Monitoring',
  icon: 'pulse',
  items: [
    { path: '/platform/monitoring/health', label: 'Health', section: 'monitoring' },
    { path: '/platform/monitoring/metrics', label: 'Metrics', section: 'monitoring' },
    { path: '/platform/monitoring/uptime', label: 'Uptime', section: 'monitoring' },
    { path: '/platform/monitoring/errors', label: 'Errors', section: 'monitoring' },
    { path: '/platform/monitoring/performance', label: 'Performance', section: 'monitoring' }
  ]
};

// ---- Audit ----
export const auditRoutes: PlatformNavSection = {
  key: 'audit',
  label: 'Audit',
  icon: 'clipboard',
  items: [
    { path: '/platform/audit/logs', label: 'Logs', section: 'audit' },
    { path: '/platform/audit/compliance', label: 'Compliance', section: 'audit' },
    { path: '/platform/audit/reports', label: 'Reports', section: 'audit' }
  ]
};

// ---- Recovery ----
export const recoveryRoutes: PlatformNavSection = {
  key: 'recovery',
  label: 'Recovery',
  icon: 'restore',
  items: [
    { path: '/platform/recovery/archived-tenants', label: 'Archived Tenants', section: 'recovery' },
    { path: '/platform/recovery/deleted-owners', label: 'Deleted Owners', section: 'recovery' },
    { path: '/platform/recovery/restore', label: 'Restore', section: 'recovery' }
  ]
};

// ---- Deployment & Updates ----
export const deploymentRoutes: PlatformNavSection = {
  key: 'deployment',
  label: 'Deployment & Updates',
  icon: 'rocket',
  items: [
    { path: '/platform/deployment/releases', label: 'Releases', section: 'deployment' },
    { path: '/platform/deployment/migrations', label: 'Migrations', section: 'deployment' },
    { path: '/platform/deployment/configuration', label: 'Configuration', section: 'deployment' },
    { path: '/platform/deployment/rollback', label: 'Rollback', section: 'deployment' },
    { path: '/platform/deployment/environments', label: 'Environments', section: 'deployment' }
  ]
};

// ---- Backups & Data ----
export const backupsRoutes: PlatformNavSection = {
  key: 'backups',
  label: 'Backups & Data',
  icon: 'database',
  items: [
    { path: '/platform/backups/snapshots', label: 'Snapshots', section: 'backups' },
    { path: '/platform/backups/schedules', label: 'Schedules', section: 'backups' },
    { path: '/platform/backups/restore-points', label: 'Restore Points', section: 'backups' },
    { path: '/platform/backups/exports', label: 'Data Exports', section: 'backups' }
  ]
};

// ---- Support ----
export const supportRoutes: PlatformNavSection = {
  key: 'support',
  label: 'Support',
  icon: 'headset',
  items: [
    { path: '/platform/support/tickets', label: 'Tickets', section: 'support' },
    { path: '/platform/support/escalations', label: 'Escalations', section: 'support' },
    { path: '/platform/support/announcements', label: 'Announcements', section: 'support' },
    { path: '/platform/support/maintenance', label: 'Maintenance Windows', section: 'support' }
  ]
};

// ---- AI & Models ----
export const aiRoutes: PlatformNavSection = {
  key: 'ai',
  label: 'AI & Models',
  icon: 'brain',
  items: [
    { path: '/platform/ai/models', label: 'Models', section: 'ai' },
    { path: '/platform/ai/usage', label: 'Usage & Costs', section: 'ai' },
    { path: '/platform/ai/governance', label: 'Governance', section: 'ai' },
    { path: '/platform/ai/tenant-config', label: 'Tenant Config', section: 'ai' }
  ]
};

// ---- Platform Configuration ----
export const platformConfigRoutes: PlatformNavSection = {
  key: 'platform-config',
  label: 'Platform Configuration',
  icon: 'cog',
  items: [
    { path: '/platform/config/global', label: 'Global Settings', section: 'platform-config' },
    { path: '/platform/config/email', label: 'Email Providers', section: 'platform-config' },
    { path: '/platform/config/storage', label: 'Storage Backends', section: 'platform-config' },
    { path: '/platform/config/integrations', label: 'Integrations', section: 'platform-config' },
    { path: '/platform/config/rate-limits', label: 'Rate Limits', section: 'platform-config' },
    { path: '/platform/config/feature-gates', label: 'Global Feature Gates', section: 'platform-config' }
  ]
};

// ---- Complete Navigation Tree ----
export const platformAdminNavigation: PlatformNavSection[] = [
  tenantManagementRoutes,
  subscriptionManagementRoutes,
  securityRoutes,
  monitoringRoutes,
  auditRoutes,
  recoveryRoutes,
  deploymentRoutes,
  backupsRoutes,
  supportRoutes,
  aiRoutes,
  platformConfigRoutes
];

// ---- Flat route list (for route registration) ----
export const platformAdminRoutes = [
  platformDashboardRoute,
  ...tenantManagementRoutes.items,
  ...subscriptionManagementRoutes.items,
  ...securityRoutes.items,
  ...monitoringRoutes.items,
  ...auditRoutes.items,
  ...recoveryRoutes.items,
  ...deploymentRoutes.items,
  ...backupsRoutes.items,
  ...supportRoutes.items,
  ...aiRoutes.items,
  ...platformConfigRoutes.items
] as const;

// ---- API endpoint mapping for each page ----
export const platformApiEndpoints = {
  // Dashboard
  '/platform': 'GET /api/v1/platform/tmc/dashboard',

  // Tenant Management
  '/platform/tenants': 'GET /api/v1/platform/tenant-management',
  '/platform/tenants/list': 'GET /api/v1/platform/tenant-management',
  '/platform/tenants/owners': 'GET /api/v1/platform/tenant-management',
  '/platform/tenants/domains': 'GET /api/v1/platform/tmc/:tenantId/domains',
  '/platform/tenants/branding': 'PATCH /api/v1/platform/tmc/:tenantId/branding',
  '/platform/tenants/storage': 'GET /api/v1/platform/tmc/:tenantId/usage',
  '/platform/tenants/statistics': 'GET /api/v1/platform/tmc/:tenantId/usage',

  // Subscription Management
  '/platform/subscriptions': 'GET /api/v1/platform/tmc/subscriptions',
  '/platform/subscriptions/billing': 'GET /api/v1/platform/tmc/:tenantId/billing/events',
  '/platform/subscriptions/licenses': 'GET /api/v1/platform/tmc/licenses',
  '/platform/subscriptions/feature-flags': 'GET /api/v1/platform/tmc/:tenantId/modules',

  // Security
  '/platform/security/api-keys': 'GET /api/v1/platform/tmc/:tenantId/api-keys',
  '/platform/security/oauth': 'GET /api/v1/platform/tmc/:tenantId/oauth-clients',
  '/platform/security/sessions': 'GET /api/v1/platform/tmc/impersonation/sessions',
  '/platform/security/impersonation': 'POST /api/v1/platform/tmc/:tenantId/impersonation/owners/:ownerId/start',

  // Monitoring
  '/platform/monitoring/health': 'GET /api/v1/platform/tmc/:tenantId/health',
  '/platform/monitoring/metrics': 'GET /api/v1/platform/tmc/metrics',
  '/platform/monitoring/uptime': 'GET /api/v1/platform/tmc/uptime',
  '/platform/monitoring/errors': 'GET /api/v1/platform/tmc/errors',
  '/platform/monitoring/performance': 'GET /api/v1/platform/tmc/performance',

  // Audit
  '/platform/audit/logs': 'GET /api/v1/platform/tmc/:tenantId/audit',
  '/platform/audit/compliance': 'GET /api/v1/platform/tmc/compliance',
  '/platform/audit/reports': 'GET /api/v1/platform/tmc/audit-reports',

  // Recovery
  '/platform/recovery/archived-tenants': 'GET /api/v1/platform/tmc/recovery/tenants',
  '/platform/recovery/deleted-owners': 'GET /api/v1/platform/tmc/:tenantId/deleted-owners',
  '/platform/recovery/restore': 'POST /api/v1/platform/tenant-management/:tenantId/restore',

  // Deployment & Updates
  '/platform/deployment/releases': 'GET /api/v1/platform/tmc/deployment/releases',
  '/platform/deployment/migrations': 'GET /api/v1/platform/tmc/deployment/migrations',
  '/platform/deployment/configuration': 'GET /api/v1/platform/tmc/deployment/config',
  '/platform/deployment/rollback': 'POST /api/v1/platform/tmc/deployment/rollback',
  '/platform/deployment/environments': 'GET /api/v1/platform/tmc/deployment/environments',

  // Backups & Data
  '/platform/backups/snapshots': 'GET /api/v1/platform/tmc/backups/snapshots',
  '/platform/backups/schedules': 'GET /api/v1/platform/tmc/backups/schedules',
  '/platform/backups/restore-points': 'GET /api/v1/platform/tmc/backups/restore-points',
  '/platform/backups/exports': 'GET /api/v1/platform/tmc/backups/exports',

  // Support
  '/platform/support/tickets': 'GET /api/v1/platform/tmc/support/tickets',
  '/platform/support/escalations': 'GET /api/v1/platform/tmc/support/escalations',
  '/platform/support/announcements': 'GET /api/v1/platform/tmc/support/announcements',
  '/platform/support/maintenance': 'GET /api/v1/platform/tmc/support/maintenance',

  // AI & Models
  '/platform/ai/models': 'GET /api/v1/platform/tmc/ai/models',
  '/platform/ai/usage': 'GET /api/v1/platform/tmc/ai/usage',
  '/platform/ai/governance': 'GET /api/v1/platform/tmc/ai/governance',
  '/platform/ai/tenant-config': 'GET /api/v1/platform/tmc/ai/tenant-config',

  // Platform Configuration
  '/platform/config/global': 'GET /api/v1/platform/tmc/config/global',
  '/platform/config/email': 'GET /api/v1/platform/tmc/config/email',
  '/platform/config/storage': 'GET /api/v1/platform/tmc/config/storage',
  '/platform/config/integrations': 'GET /api/v1/platform/tmc/config/integrations',
  '/platform/config/rate-limits': 'GET /api/v1/platform/tmc/config/rate-limits',
  '/platform/config/feature-gates': 'GET /api/v1/platform/tmc/config/feature-gates'
} as const;
