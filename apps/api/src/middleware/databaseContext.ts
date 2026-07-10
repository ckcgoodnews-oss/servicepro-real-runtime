export type RequestDatabaseContext = {
  tenantId: string;
  userId?: string;
  requestId: string;
};

export function requireDatabaseTenantContext(context: RequestDatabaseContext): string {
  if (!context.tenantId) {
    throw new Error('Missing tenantId in database request context.');
  }
  return context.tenantId;
}
