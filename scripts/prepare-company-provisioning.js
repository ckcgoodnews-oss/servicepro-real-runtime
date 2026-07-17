const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const dotenv = require('dotenv');
const {
  buildManifest,
  inferProjectRef,
  readManifestConfig,
  writeJsonAtomic
} = require('./generate-company-deployment-manifest');

const SECRET_KEYS = new Set([
  'DATABASE_URL',
  'COMPANY_OWNER_PASSWORD',
  'SMOKE_PASSWORD',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY'
]);

function readEnvFile(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) throw new Error(`Company environment file not found: ${resolved}`);
  return { resolved, env: dotenv.parse(fs.readFileSync(resolved, 'utf8')) };
}

function validateProvisioningEnv(env) {
  const config = readManifestConfig(env);
  const password = String(env.COMPANY_OWNER_PASSWORD || '');
  if (password.length < 12) throw new Error('COMPANY_OWNER_PASSWORD must contain at least 12 characters.');
  if (/changeme|replacewith|password123/i.test(password)) {
    throw new Error('COMPANY_OWNER_PASSWORD still contains an example or weak placeholder value.');
  }
  const allowExisting = String(env.ALLOW_EXISTING_DATABASE || 'false').toLowerCase();
  if (!['true', 'false'].includes(allowExisting)) throw new Error('ALLOW_EXISTING_DATABASE must be true or false.');
  const keepDemo = String(env.KEEP_DEMO_DATA || 'false').toLowerCase();
  if (!['true', 'false'].includes(keepDemo)) throw new Error('KEEP_DEMO_DATA must be true or false.');
  return { config, allowExisting: allowExisting === 'true', keepDemoData: keepDemo === 'true' };
}

function buildRenderVariableChecklist(env, config) {
  return [
    ['NODE_ENV', 'production'],
    ['DATA_STORE', 'postgres'],
    ['DATABASE_URL', '<set securely in Render>'],
    ['DATABASE_SSL', String(env.DATABASE_SSL || 'true')],
    ['APP_BASE_URL', config.webUrl || '<company web URL>'],
    ['CORS_ORIGINS', config.webUrl || '<company web URL>'],
    ['DEFAULT_TENANT_ID', config.tenantId]
  ].map(([name, value]) => ({ name, value, secret: name === 'DATABASE_URL' }));
}

function buildProvisioningPlan(env, now = new Date()) {
  const { config, allowExisting, keepDemoData } = validateProvisioningEnv(env);
  const manifest = buildManifest(config, now);
  return {
    schemaVersion: 1,
    generatedAt: now.toISOString(),
    mode: 'dedicated-supabase-project-per-company',
    company: manifest.company,
    supabase: {
      projectRef: config.projectRef || inferProjectRef(env.DATABASE_URL),
      bootstrapFile: 'servicepro-bootstrap.sql',
      allowExistingDatabase: allowExisting,
      keepDemoData,
      databaseUrlIncluded: false
    },
    steps: [
      { order: 1, command: 'npm run migrations:check', purpose: 'Validate the source-controlled migration set.' },
      { order: 2, command: 'npm run supabase:provision', purpose: 'Apply the bootstrap and seed the company owner.' },
      { order: 3, command: 'npm run company:manifest', purpose: 'Generate the secret-safe deployment manifest.' },
      { order: 4, command: 'npm run test-env:smoke', purpose: 'Verify health, PostgreSQL store, login, and tenant identity.' }
    ],
    renderVariables: buildRenderVariableChecklist(env, config),
    security: {
      containsSecrets: false,
      excludedKeys: Array.from(SECRET_KEYS).sort()
    }
  };
}

function writeProvisioningPlan(env, options = {}) {
  const plan = buildProvisioningPlan(env, options.now || new Date());
  const tenantId = plan.company.tenantId;
  const output = options.output || env.COMPANY_PROVISIONING_PLAN_FILE || path.join('reports', 'company-provisioning', `${tenantId}.json`);
  return { plan, outputPath: writeJsonAtomic(output, plan) };
}

function executeProvisioning(envFile) {
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'supabase:provision'], {
    stdio: 'inherit',
    env: { ...process.env, COMPANY_ENV_FILE: envFile }
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`supabase:provision exited with code ${result.status}.`);
}

function parseArgs(argv) {
  const args = { execute: false, envFile: process.env.COMPANY_ENV_FILE || '.env.company.local' };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--execute') args.execute = true;
    else if (argv[i] === '--env-file') args.envFile = argv[++i];
    else if (argv[i] === '--output') args.output = argv[++i];
    else throw new Error(`Unknown argument: ${argv[i]}`);
  }
  return args;
}

if (require.main === module) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const { resolved, env } = readEnvFile(args.envFile);
    const result = writeProvisioningPlan(env, { output: args.output });
    console.log(JSON.stringify({ ok: true, executed: false, output: result.outputPath, tenantId: result.plan.company.tenantId, projectRef: result.plan.supabase.projectRef }, null, 2));
    if (args.execute) {
      if (String(process.env.CONFIRM_COMPANY_PROVISIONING || '').toUpperCase() !== 'YES') {
        throw new Error('Set CONFIRM_COMPANY_PROVISIONING=YES before using --execute.');
      }
      executeProvisioning(resolved);
      console.log('Company provisioning completed.');
    }
  } catch (error) {
    console.error(`Company provisioning preparation failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  buildProvisioningPlan,
  buildRenderVariableChecklist,
  parseArgs,
  readEnvFile,
  validateProvisioningEnv,
  writeProvisioningPlan
};
