export type TenantApiContext = {
  tenantId: string;
  userId?: string;
  requestId: string;
  permissions: string[];
};

export function assertTenantApiContext(context?: TenantApiContext): TenantApiContext {
  if (!context?.tenantId) {
    throw new Error('Tenant API context is required.');
  }
  return context;
}

export function assertTenantPermission(context: TenantApiContext, permission: string): void {
  if (!context.permissions.includes(permission)) {
    throw new Error(`Forbidden: missing permission ${permission}`);
  }
}
