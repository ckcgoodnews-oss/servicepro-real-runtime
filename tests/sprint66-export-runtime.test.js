const fs = require('fs');

const required = [
  'apps/api/src/services/csvExportService.js',
  'apps/api/src/repositories/exportRepository.js',
  'apps/api/src/routes/exports.js',
  'packages/database/postgres/066_export_runtime.sql'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 66 patch file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint66.json';
process.env.JWT_SECRET = 'test-secret-for-sprint-66';

const { resetRepositoriesForTest, getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const { rowsToCsv, csvResponsePayload } = require('../apps/api/src/services/csvExportService');
const { permissionsForRoles, PERMISSIONS } = require('../apps/api/src/auth/permissions');

resetRepositoriesForTest();
const repos = getRepositories();
repos.store.reset();

const customers = repos.customers.list('tenant_demo');
const csv = rowsToCsv(customers, ['id', 'firstName', 'lastName', 'email']);

if (!csv.includes('firstName') || !csv.includes('Maria')) {
  console.error('CSV export failed.');
  process.exit(1);
}

const payload = csvResponsePayload('customers.csv', customers);
const run = repos.exports.create('tenant_demo', {
  exportKey: 'customers',
  filename: payload.filename,
  rowCount: payload.rowCount,
  createdBy: 'user_owner'
});

if (!run.id || run.rowCount < 1) {
  console.error('Export audit run failed.');
  process.exit(1);
}

const ownerPermissions = permissionsForRoles(['owner']);
if (!ownerPermissions.includes(PERMISSIONS.REPORTS_EXPORT)) {
  console.error('Owner missing reports.export permission.');
  process.exit(1);
}

console.log('Sprint 66 export runtime patch test passed.');
