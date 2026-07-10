const fs = require('fs');

const required = [
  'apps/api/src/services/logger.js',
  'apps/api/src/services/healthService.js',
  'apps/api/src/middleware/requestId.js',
  'apps/api/src/middleware/requestMetrics.js',
  'apps/api/src/repositories/metricRepository.js',
  'apps/api/src/routes/observability.js',
  'packages/database/postgres/068_observability_runtime.sql'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 68 patch file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint68.json';
process.env.JWT_SECRET = 'test-secret-for-sprint-68';
process.env.APP_VERSION = '0.68.0';

const { resetRepositoriesForTest, getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const { buildHealth } = require('../apps/api/src/services/healthService');
const { summarize } = require('../apps/api/src/repositories/metricRepository');

resetRepositoriesForTest();
const repos = getRepositories();
repos.store.reset();

const health = buildHealth();
if (!health.ok || health.version !== '0.68.0') {
  console.error('Health payload failed.');
  process.exit(1);
}

repos.metrics.create('tenant_demo', {
  requestId: 'req_test',
  method: 'GET',
  route: '/api/v1/customers',
  statusCode: 200,
  durationMs: 12,
  actorType: 'user',
  actorId: 'user_owner'
});

repos.metrics.create('tenant_demo', {
  requestId: 'req_test_2',
  method: 'POST',
  route: '/api/v1/customers',
  statusCode: 500,
  durationMs: 40,
  actorType: 'user',
  actorId: 'user_owner'
});

const summary = repos.metrics.summary('tenant_demo');
if (summary.totalRequests !== 2 || summary.errorCount !== 1 || summary.byMethod.GET !== 1) {
  console.error('Metric summary failed.');
  process.exit(1);
}

const direct = summarize([{ method: 'GET', statusCode: 200, durationMs: 10 }]);
if (direct.totalRequests !== 1 || direct.avgDurationMs !== 10) {
  console.error('Metric summarize helper failed.');
  process.exit(1);
}

console.log('Sprint 68 observability runtime patch test passed.');
