const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envFile = process.env.COMPANY_ENV_FILE || path.resolve('.env.company.local');
if (fs.existsSync(envFile)) dotenv.config({ path: envFile });

const { createPostgresStore } = require('../apps/api/src/store/postgresStoreAdapter');
const { createRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const { passwordErrors } = require('../apps/api/src/routes/auth');
const { runMigrations } = require('./run-migrations');

function required(env, key) {
  const value = String(env[key] || '').trim();
  if (!value) throw new Error(`${key} is required.`);
  return value;
}

function readCompanyConfig(env = process.env) {
  const config = {
    databaseUrl: required(env, 'DATABASE_URL'),
    tenantId: required(env, 'COMPANY_TENANT_ID'),
    companyName: required(env, 'COMPANY_NAME'),
    ownerEmail: required(env, 'COMPANY_OWNER_EMAIL').toLowerCase(),
    ownerPassword: required(env, 'COMPANY_OWNER_PASSWORD'),
    supportEmail: String(env.COMPANY_SUPPORT_EMAIL || env.COMPANY_OWNER_EMAIL || '').trim().toLowerCase(),
    supportPhone: String(env.COMPANY_SUPPORT_PHONE || '').trim(),
    timezone: String(env.COMPANY_TIMEZONE || 'America/Indiana/Indianapolis').trim(),
    locale: String(env.COMPANY_LOCALE || 'en-US').trim(),
    currency: String(env.COMPANY_CURRENCY || 'USD').trim().toUpperCase(),
    keepDemoData: env.KEEP_DEMO_DATA === 'true',
    allowExistingDatabase: env.ALLOW_EXISTING_DATABASE === 'true'
  };

  if (env.DATA_STORE && env.DATA_STORE !== 'postgres') throw new Error('DATA_STORE must be postgres.');
  if (!/^[a-z][a-z0-9_]{2,63}$/.test(config.tenantId)) throw new Error('COMPANY_TENANT_ID must use 3-64 lowercase letters, numbers, or underscores and start with a letter.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.ownerEmail)) throw new Error('COMPANY_OWNER_EMAIL must be a valid email address.');
  const errors = passwordErrors(config.ownerPassword);
  if (errors.length) throw new Error(`COMPANY_OWNER_PASSWORD must include ${errors.join(', ')}.`);
  return config;
}

async function appliedMigrationCount(store) {
  const table = await store.query("SELECT to_regclass('public.postgres_runtime_migrations') AS name");
  if (!table.rows[0]?.name) return 0;
  const result = await store.query('SELECT count(*)::int AS count FROM postgres_runtime_migrations');
  return Number(result.rows[0]?.count || 0);
}

async function removeDemoSeed(tx) {
  for (const table of ['notification_queue', 'workflow_rules', 'message_templates', 'inventory_items', 'technicians', 'service_catalog', 'tenant_settings']) {
    await tx.query(`DELETE FROM ${table} WHERE tenant_id = $1`, ['tenant_demo']);
  }
  await tx.query('DELETE FROM tenants WHERE tenant_key = $1', ['tenant_demo']);
}

async function provisionCompanyDatabase(options = {}) {
  const config = options.config || readCompanyConfig();
  const store = options.store || createPostgresStore();
  const ownsStore = !options.store;
  try {
    const existingMigrations = await appliedMigrationCount(store);
    if (existingMigrations && !config.allowExistingDatabase) {
      throw new Error(`Database already has ${existingMigrations} ServicePro migration(s). Use a new Supabase project or set ALLOW_EXISTING_DATABASE=true after reviewing it.`);
    }

    const migrations = await runMigrations(store, options.logger || console);
    await store.transaction(async tx => {
      if (!config.keepDemoData && config.tenantId !== 'tenant_demo') await removeDemoSeed(tx);
      await tx.query(
        `INSERT INTO tenants (tenant_key, name) VALUES ($1, $2)
         ON CONFLICT (tenant_key) DO UPDATE SET name = EXCLUDED.name`,
        [config.tenantId, config.companyName]
      );
    });

    const repositories = createRepositories(store);
    await repositories.tenantSettings.upsert(config.tenantId, {
      tenantId: config.tenantId,
      companyName: config.companyName,
      legalName: config.companyName,
      supportEmail: config.supportEmail,
      supportPhone: config.supportPhone,
      timezone: config.timezone,
      locale: config.locale,
      currency: config.currency,
      branding: { appName: config.companyName }
    });
    const owner = await repositories.users.createSeedOwner(config.tenantId, config.ownerEmail, config.ownerPassword);
    return { tenantId: config.tenantId, companyName: config.companyName, ownerEmail: owner.email, migrations };
  } finally {
    if (ownsStore) await store.close();
  }
}

if (require.main === module) {
  provisionCompanyDatabase()
    .then(result => console.log(JSON.stringify({ ok: true, tenantId: result.tenantId, companyName: result.companyName, ownerEmail: result.ownerEmail, migrations: result.migrations }, null, 2)))
    .catch(error => { console.error(`Company provisioning failed: ${error.message}`); process.exit(1); });
}

module.exports = { appliedMigrationCount, provisionCompanyDatabase, readCompanyConfig, removeDemoSeed };
