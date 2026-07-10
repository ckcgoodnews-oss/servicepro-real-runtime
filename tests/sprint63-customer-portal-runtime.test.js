const fs = require('fs');

const required = [
  'apps/api/src/services/portalTokenService.js',
  'apps/api/src/middleware/portalAuthGuard.js',
  'apps/api/src/repositories/portalAccountRepository.js',
  'apps/api/src/repositories/portalBookingRepository.js',
  'apps/api/src/routes/portal.js',
  'packages/database/postgres/063_customer_portal_runtime.sql'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 63 patch file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint63.json';
process.env.JWT_SECRET = 'test-secret-for-sprint-63';

const { resetRepositoriesForTest, getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const { verifyPassword } = require('../apps/api/src/services/passwordService');
const { issuePortalToken, verifyPortalToken } = require('../apps/api/src/services/portalTokenService');
const { permissionsForRoles, PERMISSIONS } = require('../apps/api/src/auth/permissions');

(async () => {
  resetRepositoriesForTest();
  const repos = getRepositories();
  repos.store.reset();

  const account = await repos.portalAccounts.findByEmail('tenant_demo', 'customer@example.com');
  if (!account) {
    console.error('Portal seed account missing.');
    process.exit(1);
  }

  const passwordOk = await verifyPassword('ChangeMe123!', account.passwordHash);
  if (!passwordOk) {
    console.error('Portal password verification failed.');
    process.exit(1);
  }

  const token = issuePortalToken({
    portalAccountId: account.id,
    customerId: account.customerId,
    tenantId: account.tenantId,
    email: account.email
  });

  const claims = verifyPortalToken(token);
  if (!claims || claims.customerId !== 'cust_demo_1') {
    console.error('Portal token verification failed.');
    process.exit(1);
  }

  const booking = repos.portalBookings.create('tenant_demo', {
    customerId: account.customerId,
    portalAccountId: account.id,
    serviceType: 'Drain cleaning',
    requestedDate: '2026-07-10',
    requestedTimeWindow: 'Morning',
    problemDescription: 'Kitchen sink is clogged'
  });

  if (!booking.id) {
    console.error('Portal booking create failed.');
    process.exit(1);
  }

  const ownerPermissions = permissionsForRoles(['owner']);
  if (!ownerPermissions.includes(PERMISSIONS.PORTAL_ACCOUNTS_WRITE)) {
    console.error('Owner missing portal account permission.');
    process.exit(1);
  }

  console.log('Sprint 63 customer portal runtime patch test passed.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
