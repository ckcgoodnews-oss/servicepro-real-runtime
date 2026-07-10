const fs = require('fs');

const required = [
  'apps/api/src/services/reportingService.js',
  'apps/api/src/repositories/reportRepository.js',
  'apps/api/src/routes/reports.js',
  'packages/database/postgres/065_reporting_runtime.sql'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 65 patch file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint65.json';
process.env.JWT_SECRET = 'test-secret-for-sprint-65';

const { resetRepositoriesForTest, getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const { permissionsForRoles, PERMISSIONS } = require('../apps/api/src/auth/permissions');

resetRepositoriesForTest();
const repos = getRepositories();
repos.store.reset();

const dashboard = repos.reports.dashboard('tenant_demo');
if (!dashboard.customers || dashboard.customers.total < 1) {
  console.error('Dashboard report failed.');
  process.exit(1);
}

const revenue = repos.reports.revenue('tenant_demo');
if (revenue.invoiceTotal !== 240.75) {
  console.error(`Revenue report failed. Expected 240.75, got ${revenue.invoiceTotal}`);
  process.exit(1);
}

const inventoryValue = repos.reports.inventoryValue('tenant_demo');
if (inventoryValue.itemCount < 1 || inventoryValue.costValue <= 0) {
  console.error('Inventory value report failed.');
  process.exit(1);
}

const ownerPermissions = permissionsForRoles(['owner']);
if (!ownerPermissions.includes(PERMISSIONS.REPORTS_READ)) {
  console.error('Owner missing reports.read permission.');
  process.exit(1);
}

console.log('Sprint 65 reporting runtime patch test passed.');
