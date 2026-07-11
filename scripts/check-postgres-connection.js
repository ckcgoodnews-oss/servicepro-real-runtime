require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000
  });
  try {
    const result = await pool.query(`
      SELECT current_database() AS database,
             current_user AS role,
             current_setting('server_version') AS version,
             to_regclass('public.postgres_runtime_migrations') IS NOT NULL AS migrations_table
    `);
    const row = result.rows[0];
    const migrationState = row.migrations_table
      ? await pool.query('SELECT count(*)::int AS count, max(version) AS latest FROM postgres_runtime_migrations')
      : { rows: [{ count: 0, latest: null }] };
    const phaseNineTables = await pool.query(`
      SELECT count(*)::int AS count
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN (
          'governance_policies', 'enterprise_risks', 'continuity_plans', 'risk_vendors',
          'enterprise_assets', 'managed_certificates', 'enterprise_secrets'
        )
    `);
    console.log(JSON.stringify({
      connected: true,
      database: row.database,
      role: row.role,
      version: row.version,
      migrationsTable: row.migrations_table,
      appliedMigrations: migrationState.rows[0].count,
      latestMigration: migrationState.rows[0].latest,
      phaseNineTables: phaseNineTables.rows[0].count
    }));
  } finally {
    await pool.end();
  }
}

main().catch(error => {
  console.error(JSON.stringify({ connected: false, code: error.code || '', message: error.message }));
  process.exit(1);
});
