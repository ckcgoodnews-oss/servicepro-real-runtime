const fs = require('fs');

const required = [
  'apps/api/src/services/securityConfig.js',
  'apps/api/src/middleware/securityHeaders.js',
  'apps/api/src/middleware/cors.js',
  'apps/api/src/middleware/bodyLimit.js',
  'apps/api/src/middleware/rateLimit.js',
  'apps/api/src/services/rateLimitService.js',
  'apps/api/src/repositories/securityEventRepository.js',
  'apps/api/src/routes/security.js',
  'packages/database/postgres/069_security_hardening_runtime.sql'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 69 patch file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint69.json';
process.env.JWT_SECRET = 'test-secret-for-sprint-69';
process.env.RATE_LIMIT_MAX_REQUESTS = '2';
process.env.AUTH_RATE_LIMIT_MAX_REQUESTS = '1';
process.env.RATE_LIMIT_WINDOW_MS = '60000';

const { resetRepositoriesForTest, getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const { securityConfig } = require('../apps/api/src/services/securityConfig');
const { checkRateLimit, resetRateLimits } = require('../apps/api/src/services/rateLimitService');

resetRepositoriesForTest();
const repos = getRepositories();
repos.store.reset();

const config = securityConfig();
if (config.rateLimitMaxRequests !== 2 || config.authRateLimitMaxRequests !== 1) {
  console.error('Security config failed.');
  process.exit(1);
}

resetRateLimits();
const req = { headers: {}, socket: { remoteAddress: '127.0.0.1' }, url: '/api/v1/customers', context: { tenantId: 'tenant_demo' } };
const first = checkRateLimit(req, config);
const second = checkRateLimit(req, config);
const third = checkRateLimit(req, config);

if (!first.allowed || !second.allowed || third.allowed) {
  console.error('Rate limiting failed.');
  process.exit(1);
}

const event = repos.securityEvents.create('tenant_demo', {
  eventType: 'security.test',
  subject: 'rate-limit',
  severity: 'info',
  metadata: { ok: true }
});

if (!event.id) {
  console.error('Security event create failed.');
  process.exit(1);
}

console.log('Sprint 69 security hardening runtime patch test passed.');
