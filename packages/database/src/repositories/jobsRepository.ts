import { DatabaseClient } from '../client';
import { TenantRepository } from '../tenantRepository';

export type JobRecord = {
  id: string;
  tenantId: string;
  customerId?: string;
  title: string;
  status: string;
};

export class JobsRepository extends TenantRepository<JobRecord> {
  constructor(db: DatabaseClient, tenantId: string) {
    super(db, tenantId);
  }

  async findById(id: string): Promise<JobRecord | null> {
    const result = await this.db.query<JobRecord>(
      `SELECT id, tenant_id as "tenantId", customer_id as "customerId", title, status
       FROM jobs
       WHERE tenant_id = $1 AND id = $2
       LIMIT 1`,
      [this.tenantId, id]
    );

    return result.rows[0] || null;
  }

  async list(): Promise<JobRecord[]> {
    const result = await this.db.query<JobRecord>(
      `SELECT id, tenant_id as "tenantId", customer_id as "customerId", title, status
       FROM jobs
       WHERE tenant_id = $1
       ORDER BY created_at DESC`,
      [this.tenantId]
    );

    return result.rows;
  }
}
