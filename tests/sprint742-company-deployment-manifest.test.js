const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  buildManifest,
  generateCompanyDeploymentManifest,
  inferProjectRef,
  readManifestConfig
} = require('../scripts/generate-company-deployment-manifest');

(() => {
  assert.strictEqual(
    inferProjectRef('postgresql://postgres.ipdnxfvpcwdxqltqyeam:secret@aws-0-us-east-2.pooler.supabase.com:5432/postgres'),
    'ipdnxfvpcwdxqltqyeam'
  );
  assert.strictEqual(
    inferProjectRef('postgresql://postgres:secret@db.ipdnxfvpcwdxqltqyeam.supabase.co:5432/postgres'),
    'ipdnxfvpcwdxqltqyeam'
  );

  const env = {
    DATA_STORE: 'postgres',
    DATABASE_URL: 'postgresql://postgres.ipdnxfvpcwdxqltqyeam:do-not-emit@pooler.example.com:5432/postgres',
    COMPANY_TENANT_ID: 'acme_plumbing',
    COMPANY_NAME: 'Acme Plumbing',
    COMPANY_OWNER_EMAIL: 'OWNER@EXAMPLE.COM',
    COMPANY_OWNER_PASSWORD: 'NeverWriteThis123!',
    COMPANY_SUPPORT_EMAIL: 'support@example.com',
    COMPANY_API_URL: 'https://api.acme.example/',
    COMPANY_WEB_URL: 'https://acme.example/',
    COMPANY_EXPECTED_VERSION: '8.0.0-alpha.1',
    SMOKE_PASSWORD: 'also-never-write'
  };
  const config = readManifestConfig(env);
  assert.strictEqual(config.ownerEmail, 'owner@example.com');
  assert.strictEqual(config.projectRef, 'ipdnxfvpcwdxqltqyeam');
  assert.strictEqual(config.apiUrl, 'https://api.acme.example');

  const manifest = buildManifest(config, new Date('2026-07-16T12:00:00.000Z'));
  assert.strictEqual(manifest.supabase.isolationModel, 'dedicated-project-per-company');
  assert.strictEqual(manifest.deployment.expectedStore, 'postgres');
  assert.strictEqual(manifest.verification.tenantId, 'acme_plumbing');
  assert.strictEqual(manifest.security.containsSecrets, false);

  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'servicepro-s742-'));
  const output = path.join(directory, 'manifest.json');
  const result = generateCompanyDeploymentManifest({ env, output, now: new Date('2026-07-16T12:00:00.000Z') });
  assert.strictEqual(result.outputPath, output);
  const text = fs.readFileSync(output, 'utf8');
  const saved = JSON.parse(text);
  assert.strictEqual(saved.company.tenantId, 'acme_plumbing');
  assert.ok(!text.includes('do-not-emit'));
  assert.ok(!text.includes('NeverWriteThis123!'));
  assert.ok(!text.includes('also-never-write'));
  assert.ok(!text.includes('DATABASE_URL":"'));

  assert.throws(
    () => readManifestConfig({ ...env, DATA_STORE: 'json' }),
    /DATA_STORE must be postgres/
  );
  assert.throws(
    () => readManifestConfig({ ...env, COMPANY_TENANT_ID: 'Bad Tenant' }),
    /COMPANY_TENANT_ID/
  );
  assert.throws(
    () => readManifestConfig({ ...env, COMPANY_API_URL: 'ftp:\/\/invalid.example' }),
    /valid http or https URL/
  );

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.strictEqual(packageJson.scripts['company:manifest'], 'node scripts/generate-company-deployment-manifest.js');
  const envExample = fs.readFileSync('.env.company.example', 'utf8');
  assert.match(envExample, /SUPABASE_PROJECT_REF=/);
  assert.match(envExample, /COMPANY_MANIFEST_FILE=/);
  const guide = fs.readFileSync('SUPABASE_DEPLOYMENT.md', 'utf8');
  assert.match(guide, /npm run company:manifest/);
  assert.match(guide, /does not contain the database URL or owner password/);

  console.log('Sprint 742 company deployment manifest test passed.');
})();
