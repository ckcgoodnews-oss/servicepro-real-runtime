const fs = require('fs');

const required = [
  'apps/api/src/auth/permissions.js',
  'apps/api/src/middleware/requirePermission.js',
  'apps/api/src/repositories/authEventRepository.js',
  'apps/api/src/routes/auth.js',
  'packages/database/postgres/056_rbac_runtime.sql'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 56 patch file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint56.json';
process.env.JWT_SECRET = 'test-secret-for-sprint-56-rbac-runtime';

const { resetRepositoriesForTest, getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const { permissionsForRoles, hasPermission, PERMISSIONS } = require('../apps/api/src/auth/permissions');

(async () => {
  resetRepositoriesForTest();
  const repos = getRepositories();
  repos.store.reset();

  const owner = await repos.users.findByEmail('tenant_demo', 'owner@example.com');
  const tech = await repos.users.findByEmail('tenant_demo', 'tech@example.com');

  if (!owner || !tech) {
    console.error('Seed users missing.');
    process.exit(1);
  }

  const ownerPermissions = permissionsForRoles(owner.roles);
  const techPermissions = permissionsForRoles(tech.roles);

  if (!ownerPermissions.includes(PERMISSIONS.CUSTOMERS_DELETE)) {
    console.error('Owner should have customer delete permission.');
    process.exit(1);
  }

  if (techPermissions.includes(PERMISSIONS.CUSTOMERS_DELETE)) {
    console.error('Technician should not have customer delete permission.');
    process.exit(1);
  }

  const context = { permissions: techPermissions };
  if (!hasPermission(context, PERMISSIONS.JOBS_WRITE)) {
    console.error('Technician should have jobs.write permission.');
    process.exit(1);
  }

  await repos.authEvents.log({
    tenantId: 'tenant_demo',
    userId: owner.id,
    eventType: 'auth.test_event',
    email: owner.email,
    status: 'success'
  });

  const events = await repos.authEvents.list('tenant_demo');
  if (!events.length) {
    console.error('Auth event logging failed.');
    process.exit(1);
  }

  console.log('Sprint 56 RBAC runtime patch test passed.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
