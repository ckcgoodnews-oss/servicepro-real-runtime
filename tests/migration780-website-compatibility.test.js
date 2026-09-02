const assert = require('assert');
const fs = require('fs');
const path = require('path');

const migrationPath = path.join(
  __dirname,
  '..',
  'packages',
  'database',
  'postgres',
  '780_website_builder_and_automation.sql'
);
const migration = fs.readFileSync(migrationPath, 'utf8');

for (const clause of [
  'ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS tenant_id text;',
  'ALTER TABLE website_themes ADD COLUMN IF NOT EXISTS tenant_id text;',
  'ALTER TABLE website_media ADD COLUMN IF NOT EXISTS tenant_id text;',
  "ALTER TABLE automation_executions ADD COLUMN IF NOT EXISTS workflow_id text NOT NULL DEFAULT '';",
  'CREATE UNIQUE INDEX IF NOT EXISTS website_pages_tenant_slug_idx',
  'CREATE INDEX IF NOT EXISTS automation_executions_workflow_idx'
]) {
  assert(migration.includes(clause), `migration must contain: ${clause}`);
}

async function validateAgainstPostgres() {
  if (process.env.LIVE_POSTGRES !== '1') return;

  const { Client } = require('pg');
  const schema = `migration_780_${Date.now().toString(36)}`;
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
      CREATE TABLE website_pages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid,
        title text NOT NULL, slug text NOT NULL, created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
      CREATE TABLE website_themes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(), theme_key text NOT NULL,
        name text NOT NULL, created_at timestamptz DEFAULT now()
      );
      CREATE TABLE website_media (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid,
        title text, media_type text, url text NOT NULL, alt_text text,
        created_at timestamptz DEFAULT now()
      );
      CREATE TABLE automation_executions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL,
        rule_id uuid, trigger_data jsonb, conditions_met boolean,
        actions_executed jsonb, status text, executed_at timestamptz
      );
    `);

    await client.query(body);

    const required = await client.query(
      `SELECT table_name, column_name
         FROM information_schema.columns
        WHERE table_schema = $1
          AND (table_name, column_name) IN (
            ('website_pages', 'tenant_id'),
            ('website_themes', 'tenant_id'),
            ('website_media', 'tenant_id'),
            ('automation_executions', 'workflow_id'),
            ('automation_executions', 'started_at')
          )
        ORDER BY table_name, column_name`,
      [schema]
    );
    assert.strictEqual(required.rowCount, 5);

    const indexes = await client.query(
      `SELECT indexname FROM pg_indexes
        WHERE schemaname = $1
          AND indexname IN (
            'website_pages_tenant_slug_idx',
            'website_media_tenant_idx',
            'automation_executions_workflow_idx'
          )`,
      [schema]
    );
    assert.strictEqual(indexes.rowCount, 3);
  } finally {
    await client.query('ROLLBACK').catch(() => {});
    await client.end();
  }
}

validateAgainstPostgres()
  .then(() => console.log('migration 780 website compatibility tests passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
