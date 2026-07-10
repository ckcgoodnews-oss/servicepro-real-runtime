const fs = require('fs');

const required = [
  'apps/api/src/errors/domainError.js',
  'apps/api/src/utils/safeJson.js',
  'apps/api/src/services/validationSchemaService.js',
  'apps/api/src/middleware/routeValidation.js',
  'apps/api/src/services/integrityService.js',
  'apps/api/src/repositories/integrityRepository.js',
  'apps/api/src/routes/integrity.js',
  'packages/database/postgres/070_validation_integrity_runtime.sql'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 70 patch file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint70.json';
process.env.JWT_SECRET = 'test-secret-for-sprint-70';

const { resetRepositoriesForTest, getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const { parseJsonText } = require('../apps/api/src/utils/safeJson');
const { validateRoute } = require('../apps/api/src/services/validationSchemaService');
const { runJsonIntegrityChecks } = require('../apps/api/src/services/integrityService');
const { permissionsForRoles, PERMISSIONS } = require('../apps/api/src/auth/permissions');

resetRepositoriesForTest();
const repos = getRepositories();
repos.store.reset();

const parsed = parseJsonText('{"ok":true}');
if (!parsed.ok) {
  console.error('Safe JSON parser failed.');
  process.exit(1);
}

let validationFailed = false;
try {
  validateRoute('POST', '/api/v1/customers', { firstName: 'NoLastName' });
} catch (err) {
  validationFailed = err.code === 'validation_failed';
}
if (!validationFailed) {
  console.error('Route validation failed to reject invalid customer.');
  process.exit(1);
}

const integrity = repos.integrity.run('tenant_demo');
if (integrity.status !== 'passed') {
  console.error('Integrity check should pass on seed data.');
  process.exit(1);
}

const data = repos.store.read();
data.jobs.push({ id: 'job_bad', tenantId: 'tenant_demo', customerId: 'missing', title: 'Bad job' });
const result = runJsonIntegrityChecks(data, 'tenant_demo');
if (result.status !== 'failed' || result.issueCount < 1) {
  console.error('Integrity check failed to detect missing customer.');
  process.exit(1);
}

const ownerPermissions = permissionsForRoles(['owner']);
if (!ownerPermissions.includes(PERMISSIONS.INTEGRITY_RUN)) {
  console.error('Owner missing integrity.run permission.');
  process.exit(1);
}

console.log('Sprint 70 validation/integrity runtime patch test passed.');
