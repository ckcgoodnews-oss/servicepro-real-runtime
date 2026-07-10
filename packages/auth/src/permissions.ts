export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  CUSTOMERS_READ: 'customers.read',
  CUSTOMERS_WRITE: 'customers.write',
  JOBS_READ: 'jobs.read',
  JOBS_WRITE: 'jobs.write',
  ESTIMATES_READ: 'estimates.read',
  ESTIMATES_WRITE: 'estimates.write',
  INVOICES_READ: 'invoices.read',
  INVOICES_WRITE: 'invoices.write',
  SETTINGS_READ: 'settings.read',
  SETTINGS_WRITE: 'settings.write',
  BILLING_MANAGE: 'billing.manage',
  AUDIT_READ: 'audit.read',
  INSTALLER_MANAGE: 'installer.manage'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ROLE_PERMISSION_PRESETS: Record<string, Permission[]> = {
  owner: Object.values(PERMISSIONS),
  manager: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.CUSTOMERS_WRITE,
    PERMISSIONS.JOBS_READ,
    PERMISSIONS.JOBS_WRITE,
    PERMISSIONS.ESTIMATES_READ,
    PERMISSIONS.ESTIMATES_WRITE,
    PERMISSIONS.INVOICES_READ
  ],
  technician: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.JOBS_READ,
    PERMISSIONS.JOBS_WRITE,
    PERMISSIONS.CUSTOMERS_READ
  ],
  billing: [
    PERMISSIONS.INVOICES_READ,
    PERMISSIONS.INVOICES_WRITE,
    PERMISSIONS.BILLING_MANAGE
  ]
};
