const fs = require('fs');

const required = [
  'apps/api/src/services/tokenService.js',
  'apps/api/src/services/passwordService.js',
  'apps/api/src/repositories/userRepository.js',
  'apps/api/src/routes/auth.js',
  'apps/api/src/middleware/authGuard.js',
  'packages/database/postgres/055_auth_runtime.sql',
  'scripts/seed-auth.js'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 55 patch file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint55.json';
process.env.JWT_SECRET = 'test-secret-for-sprint-55-auth-runtime';

const { resetRepositoriesForTest, getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const { verifyPassword } = require('../apps/api/src/services/passwordService');
const { issueAccessToken, verifyAccessToken } = require('../apps/api/src/services/tokenService');

(async () => {
  resetRepositoriesForTest();
  const repos = getRepositories();
  repos.store.reset();

  const user = await repos.users.findByEmail('tenant_demo', 'owner@example.com');
  if (!user) {
    console.error('Seed owner missing.');
    process.exit(1);
  }

  const ok = await verifyPassword('ChangeMe123!', user.passwordHash);
  if (!ok) {
    console.error('Password verification failed.');
    process.exit(1);
  }

  const token = issueAccessToken({
    userId: user.id,
    tenantId: user.tenantId,
    email: user.email,
    roles: user.roles,
    permissions: user.permissions
  });

  const claims = verifyAccessToken(token);
  if (!claims || claims.email !== 'owner@example.com') {
    console.error('Token verification failed.');
    process.exit(1);
  }

  console.log('Sprint 55 auth runtime patch test passed.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
