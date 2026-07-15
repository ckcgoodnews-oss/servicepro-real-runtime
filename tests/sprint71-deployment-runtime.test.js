const fs = require('fs');

const required = [
  'Dockerfile',
  'docker-compose.yml',
  '.env.production.example',
  'apps/api/src/services/configValidationService.js',
  'scripts/check-config.js',
  'scripts/deployment-check.js',
  'scripts/docker-bootstrap-postgres.sh',
  'scripts/docker-bootstrap-postgres.ps1',
  'packages/database/postgres/071_deployment_runtime.sql',
  'docs/deployment-checklist.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 71 patch file: ${file}`);
    process.exit(1);
  }
}

const { validateRuntimeConfig } = require('../apps/api/src/services/configValidationService');

process.env.NODE_ENV = 'production';
process.env.PORT = '3000';
process.env.DEFAULT_TENANT_ID = 'tenant_demo';
process.env.DATA_STORE = 'postgres';
process.env.DATABASE_URL = 'postgresql://servicepro:servicepro@localhost:5432/servicepro';
process.env.JWT_SECRET = 'x'.repeat(64);
process.env.PORTAL_TOKEN_SECRET = 'y'.repeat(64);
process.env.CORS_ALLOWED_ORIGINS = 'https://app.example.com';
process.env.MAX_JSON_BODY_BYTES = '1048576';

const valid = validateRuntimeConfig();
if (!valid.ok) {
  console.error(`Expected production config to pass: ${valid.errors.join('; ')}`);
  process.exit(1);
}

process.env.JWT_SECRET = 'short';
const invalid = validateRuntimeConfig();
if (invalid.ok || !invalid.errors.some(e => e.includes('JWT_SECRET'))) {
  console.error('Expected short JWT_SECRET to fail config validation.');
  process.exit(1);
}

const dockerfile = fs.readFileSync('Dockerfile', 'utf8');

const hasHealthCheck = dockerfile.includes('HEALTHCHECK');

const hasRuntimeCommand =
  dockerfile.includes('node apps/api/src/server.js') ||
  /CMD\s*\[\s*["']node["']\s*,\s*["']apps\/api\/src\/server\.js["']\s*\]/i.test(
    dockerfile
  );

if (!hasHealthCheck || !hasRuntimeCommand) {
  console.error('Dockerfile is missing healthcheck or runtime command.');
  process.exit(1);
}

console.log('Sprint 71 deployment runtime patch test passed.');

