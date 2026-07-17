const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  buildProvisioningPlan,
  validateProvisioningEnv,
  writeProvisioningPlan
} = require('../scripts/prepare-company-provisioning');

const env = {
  DATA_STORE: 'postgres',
  DATABASE_SSL: 'true',
  DATABASE_URL: 'postgresql://postgres.abcdefghijk:SecretValue@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
  COMPANY_TENANT_ID: 'acme_services',
  COMPANY_NAME: 'Acme Services',
  COMPANY_OWNER_EMAIL: 'owner@acme.example',
  COMPANY_OWNER_PASSWORD: 'Unique!Owner!Pass!744',
  COMPANY_SUPPORT_EMAIL: 'support@acme.example',
  COMPANY_TIMEZONE: 'America/Indiana/Indianapolis',
  COMPANY_LOCALE: 'en-US',
  COMPANY_CURRENCY: 'USD',
  ALLOW_EXISTING_DATABASE: 'false',
  KEEP_DEMO_DATA: 'false',
  SUPABASE_PROJECT_REF: 'abcdefghijk',
  COMPANY_API_URL: 'https://acme-api.onrender.com',
  COMPANY_WEB_URL: 'https://acme.example.com'
};

validateProvisioningEnv(env);
const plan = buildProvisioningPlan(env, new Date('2026-07-16T12:00:00.000Z'));
assert.strictEqual(plan.company.tenantId, 'acme_services');
assert.strictEqual(plan.supabase.projectRef, 'abcdefghijk');
assert.strictEqual(plan.supabase.databaseUrlIncluded, false);
assert.strictEqual(plan.steps.length, 4);
assert.ok(plan.renderVariables.some((item) => item.name === 'DATABASE_URL' && item.secret));
const serialized = JSON.stringify(plan);
assert.ok(!serialized.includes('SecretValue'));
assert.ok(!serialized.includes('Unique!Owner!Pass!744'));

assert.throws(() => validateProvisioningEnv({ ...env, COMPANY_OWNER_PASSWORD: 'ChangeMe123!' }), /placeholder|weak/i);
assert.throws(() => validateProvisioningEnv({ ...env, ALLOW_EXISTING_DATABASE: 'maybe' }), /true or false/i);

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'sprint744-'));
const output = path.join(temp, 'plan.json');
const result = writeProvisioningPlan(env, { output, now: new Date('2026-07-16T12:00:00.000Z') });
assert.strictEqual(result.outputPath, path.resolve(output));
assert.ok(fs.existsSync(output));
assert.strictEqual(JSON.parse(fs.readFileSync(output, 'utf8')).security.containsSecrets, false);
console.log('Sprint 744 company provisioning automation test passed.');
