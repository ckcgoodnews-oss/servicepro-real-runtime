const fs = require('fs');
const path = require('path');

const required = [
  '.github/workflows/ci.yml',
  '.github/workflows/docker-build.yml',
  '.github/workflows/postgres-smoke.yml',
  '.github/pull_request_template.md',
  '.github/ISSUE_TEMPLATE/bug_report.md',
  '.github/ISSUE_TEMPLATE/feature_request.md',
  'scripts/check-migrations.js',
  'docs/ci-cd-guide.md',
  'docs/release-checklist.md',
  'docs/branch-protection.md',
  'packages/database/postgres/072_cicd_runtime.sql'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 72 patch file: ${file}`);
    process.exit(1);
  }
}

const ci = fs.readFileSync('.github/workflows/ci.yml', 'utf8');
if (!ci.includes('npm run migrations:check') || !ci.includes('npm test')) {
  console.error('CI workflow missing migration check or test command.');
  process.exit(1);
}

const docker = fs.readFileSync('.github/workflows/docker-build.yml', 'utf8');
if (!docker.includes('docker build')) {
  console.error('Docker workflow missing docker build command.');
  process.exit(1);
}

const migrationDir = path.resolve('packages/database/postgres');
const migrations = fs.readdirSync(migrationDir).filter(name => /^\d{3}_.+\.sql$/.test(name));
if (!migrations.includes('072_cicd_runtime.sql')) {
  console.error('Sprint 72 migration missing.');
  process.exit(1);
}

console.log('Sprint 72 CI/CD runtime patch test passed.');
