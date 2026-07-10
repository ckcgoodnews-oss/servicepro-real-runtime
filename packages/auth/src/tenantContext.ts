export type TenantContext = {
  tenantId: string;
  tenantSlug?: string;
  customDomain?: string;
  planCode?: string;
  featureFlags: Record<string, boolean>;
};

export function assertTenantContext(context?: TenantContext): TenantContext {
  if (!context?.tenantId) {
    throw new Error('Tenant context is required.');
  }
  return context;
}
