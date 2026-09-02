const assert = require('assert');
const fs = require('fs');
const path = require('path');

const migrationPath = path.join(
  __dirname,
  '..',
  'packages',
  'database',
  'postgres',
  '779_crm_and_marketing.sql'
);
const migration = fs.readFileSync(migrationPath, 'utf8');

for (const table of ['crm_leads', 'marketing_campaigns']) {
  const drop = `DROP POLICY IF EXISTS tenant_isolation ON ${table};`;
  const alter = `ALTER TABLE ${table} ALTER COLUMN tenant_id TYPE text`;
  const recreate = `CREATE POLICY tenant_isolation ON ${table}`;

  assert(migration.includes(drop), `${table} must remove its dependent RLS policy`);
  assert(migration.includes(alter), `${table} must normalize tenant_id to text`);
  assert(migration.includes(recreate), `${table} must restore tenant isolation`);
  assert(migration.indexOf(drop) < migration.indexOf(alter), `${table} policy must be dropped before the type change`);
  assert(migration.indexOf(alter) < migration.indexOf(recreate), `${table} policy must be restored after the type change`);
  assert(
    migration.includes(`ALTER TABLE ${table} FORCE ROW LEVEL SECURITY;`),
    `${table} must enforce RLS for table owners`
  );
}

assert(
  migration.includes("current_setting('app.current_tenant', true)"),
  'tenant policy must use the runtime tenant context'
);

async function validateAgainstPostgres() {
  if (process.env.LIVE_POSTGRES !== '1') return;

  const { Client } = require('pg');
  const schema = `migration_779_${Date.now().toString(36)}`;
  const body = migration
    .replace(/^\s*BEGIN;\s*/i, '')
    .replace(/\s*COMMIT;\s*$/i, '');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query(`CREATE SCHEMA ${schema}`);
    await client.query(`SET LOCAL search_path TO ${schema}, public`);
    await client.query(`
      CREATE TABLE crm_leads (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL,
        status text NOT NULL DEFAULT 'new',
        email text,
        phone text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
      CREATE POLICY tenant_isolation ON crm_leads
        FOR ALL USING (tenant_id::text = current_setting('app.current_tenant', true));

      CREATE TABLE marketing_campaigns (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL,
        name text NOT NULL,
        channel text NOT NULL,
        status text NOT NULL DEFAULT 'draft',
        scheduled_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
      CREATE POLICY tenant_isolation ON marketing_campaigns
        FOR ALL USING (tenant_id::text = current_setting('app.current_tenant', true));
    `);

    await client.query(body);

    const columns = await client.query(
      `SELECT table_name, data_type
         FROM information_schema.columns
        WHERE table_schema = $1
          AND table_name IN ('crm_leads', 'marketing_campaigns')
          AND column_name = 'tenant_id'
        ORDER BY table_name`,
      [schema]
    );
    assert.deepStrictEqual(
      columns.rows,
      [
        { table_name: 'crm_leads', data_type: 'text' },
        { table_name: 'marketing_campaigns', data_type: 'text' }
      ]
    );

    const policies = await client.query(
      `SELECT tablename, policyname
         FROM pg_policies
        WHERE schemaname = $1
          AND tablename IN ('crm_leads', 'marketing_campaigns')
        ORDER BY tablename`,
      [schema]
    );
    assert.deepStrictEqual(
      policies.rows,
      [
        { tablename: 'crm_leads', policyname: 'tenant_isolation' },
        { tablename: 'marketing_campaigns', policyname: 'tenant_isolation' }
      ]
    );
  } finally {
    await client.query('ROLLBACK').catch(() => {});
    await client.end();
  }
}

validateAgainstPostgres()
  .then(() => console.log('migration 779 CRM and marketing compatibility tests passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
