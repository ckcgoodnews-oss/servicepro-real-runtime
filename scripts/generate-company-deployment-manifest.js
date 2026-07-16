const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function required(env, key) {
  const value = String(env[key] || '').trim();
  if (!value) throw new Error(`${key} is required.`);
  return value;
}

function optionalUrl(env, key) {
  const value = String(env[key] || '').trim();
  if (!value) return null;
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${key} must be a valid http or https URL.`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`${key} must be a valid http or https URL.`);
  }
  return parsed.toString().replace(/\/$/, '');
}

function validateTenantId(value) {
  if (!/^[a-z][a-z0-9_]{2,63}$/.test(value)) {
    throw new Error('COMPANY_TENANT_ID must use 3-64 lowercase letters, numbers, or underscores and start with a letter.');
  }
  return value;
}

function validateEmail(value, key) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error(`${key} must be a valid email address.`);
  }
  return normalized;
}

function inferProjectRef(databaseUrl) {
  const value = String(databaseUrl || '').trim();
  if (!value) return null;
  try {
    const parsed = new URL(value);
    const userMatch = parsed.username.match(/^postgres\.([a-z0-9]+)$/i);
    if (userMatch) return userMatch[1].toLowerCase();
    const hostMatch = parsed.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i);
    return hostMatch ? hostMatch[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

function readManifestConfig(env = process.env) {
  const tenantId = validateTenantId(required(env, 'COMPANY_TENANT_ID'));
  const ownerEmail = validateEmail(required(env, 'COMPANY_OWNER_EMAIL'), 'COMPANY_OWNER_EMAIL');
  const dataStore = String(env.DATA_STORE || 'postgres').trim().toLowerCase();
  if (dataStore !== 'postgres') throw new Error('DATA_STORE must be postgres for a company deployment.');

  const databaseUrl = required(env, 'DATABASE_URL');
  const projectRef = String(env.SUPABASE_PROJECT_REF || inferProjectRef(databaseUrl) || '').trim().toLowerCase();
  if (!projectRef) throw new Error('SUPABASE_PROJECT_REF is required when it cannot be inferred from DATABASE_URL.');
  if (!/^[a-z0-9]{8,32}$/.test(projectRef)) throw new Error('SUPABASE_PROJECT_REF must be an 8-32 character lowercase project reference.');

  return {
    tenantId,
    companyName: required(env, 'COMPANY_NAME'),
    ownerEmail,
    supportEmail: env.COMPANY_SUPPORT_EMAIL ? validateEmail(env.COMPANY_SUPPORT_EMAIL, 'COMPANY_SUPPORT_EMAIL') : ownerEmail,
    timezone: String(env.COMPANY_TIMEZONE || 'America/Indiana/Indianapolis').trim(),
    locale: String(env.COMPANY_LOCALE || 'en-US').trim(),
    currency: String(env.COMPANY_CURRENCY || 'USD').trim().toUpperCase(),
    projectRef,
    apiUrl: optionalUrl(env, 'COMPANY_API_URL'),
    webUrl: optionalUrl(env, 'COMPANY_WEB_URL'),
    expectedVersion: String(env.COMPANY_EXPECTED_VERSION || '').trim() || null,
    generatedBy: String(env.GITHUB_SHA || env.RENDER_GIT_COMMIT || 'local').trim()
  };
}

function buildManifest(config, now = new Date()) {
  const requiredRenderVariables = [
    'NODE_ENV',
    'DATA_STORE',
    'DATABASE_URL',
    'DATABASE_SSL',
    'APP_BASE_URL',
    'CORS_ORIGINS'
  ];
  const verification = {
    expectedStore: 'postgres',
    tenantId: config.tenantId,
    requireAuthenticatedSmoke: true,
    command: 'npm run test-env:smoke'
  };

  return {
    schemaVersion: 1,
    generatedAt: now.toISOString(),
    generatedBy: config.generatedBy,
    company: {
      tenantId: config.tenantId,
      name: config.companyName,
      ownerEmail: config.ownerEmail,
      supportEmail: config.supportEmail,
      timezone: config.timezone,
      locale: config.locale,
      currency: config.currency
    },
    supabase: {
      projectRef: config.projectRef,
      isolationModel: 'dedicated-project-per-company',
      databaseUrlIncluded: false,
      bootstrapFile: 'servicepro-bootstrap.sql',
      provisionCommand: 'npm run supabase:provision'
    },
    deployment: {
      apiUrl: config.apiUrl,
      webUrl: config.webUrl,
      expectedVersion: config.expectedVersion,
      expectedStore: 'postgres',
      requiredRenderVariables
    },
    verification,
    security: {
      containsSecrets: false,
      excludedValues: ['DATABASE_URL', 'COMPANY_OWNER_PASSWORD', 'SMOKE_PASSWORD', 'access tokens']
    }
  };
}

function writeJsonAtomic(filePath, value) {
  const resolved = path.resolve(filePath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  const temporary = `${resolved}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(temporary, resolved);
  return resolved;
}

function generateCompanyDeploymentManifest(options = {}) {
  const config = options.config || readManifestConfig(options.env || process.env);
  const manifest = buildManifest(config, options.now || new Date());
  const output = options.output || process.env.COMPANY_MANIFEST_FILE || path.join('reports', 'company-deployments', `${config.tenantId}.json`);
  const outputPath = writeJsonAtomic(output, manifest);
  return { manifest, outputPath };
}

if (require.main === module) {
  const envFile = process.env.COMPANY_ENV_FILE || path.resolve('.env.company.local');
  if (fs.existsSync(envFile)) dotenv.config({ path: envFile });
  try {
    const result = generateCompanyDeploymentManifest();
    console.log(JSON.stringify({ ok: true, output: result.outputPath, tenantId: result.manifest.company.tenantId, projectRef: result.manifest.supabase.projectRef }, null, 2));
  } catch (error) {
    console.error(`Company deployment manifest failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  buildManifest,
  generateCompanyDeploymentManifest,
  inferProjectRef,
  readManifestConfig,
  writeJsonAtomic
};
