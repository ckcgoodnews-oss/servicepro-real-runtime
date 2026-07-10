import { DatabaseClient } from '../client';
import { TenantRepository } from '../tenantRepository';

export type CustomerRecord = {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
};

export class CustomersRepository extends TenantRepository<CustomerRecord> {
  constructor(db: DatabaseClient, tenantId: string) {
    super(db, tenantId);
  }

  async findById(id: string): Promise<CustomerRecord | null> {
    const result = await this.db.query<CustomerRecord>(
      `SELECT id, tenant_id as "tenantId", first_name as "firstName", last_name as "lastName", email, phone
       FROM customers
       WHERE tenant_id = $1 AND id = $2
       LIMIT 1`,
      [this.tenantId, id]
    );

    return result.rows[0] || null;
  }

  async list(): Promise<CustomerRecord[]> {
    const result = await this.db.query<CustomerRecord>(
      `SELECT id, tenant_id as "tenantId", first_name as "firstName", last_name as "lastName", email, phone
       FROM customers
       WHERE tenant_id = $1
       ORDER BY last_name, first_name`,
      [this.tenantId]
    );

    return result.rows;
  }
}
