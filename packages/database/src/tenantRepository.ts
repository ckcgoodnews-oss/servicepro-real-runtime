import { DatabaseClient } from './client';

export type TenantScopedRecord = {
  id: string;
  tenantId: string;
};

export abstract class TenantRepository<T extends TenantScopedRecord> {
  protected constructor(
    protected readonly db: DatabaseClient,
    protected readonly tenantId: string
  ) {
    if (!tenantId) throw new Error('tenantId is required for tenant-scoped repositories.');
  }

  protected tenantWhereClause(alias?: string): string {
    const prefix = alias ? `${alias}.` : '';
    return `${prefix}tenant_id = $1`;
  }

  protected assertTenant(record: T): void {
    if (record.tenantId !== this.tenantId) {
      throw new Error('Cross-tenant record access blocked.');
    }
  }

  abstract findById(id: string): Promise<T | null>;
  abstract list(): Promise<T[]>;
}
