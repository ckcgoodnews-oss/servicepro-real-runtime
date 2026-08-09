'use strict';

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const tests = [
  'auth-foundation.test.js',
  'database-foundation.test.js',
  'payment-application-domain.test.js',
  'public-storefront.test.js',
  'sprint55-auth-runtime.test.js',
  'sprint57-estimates-invoices-runtime.test.js',
  'sprint58-payments-runtime.test.js',
  'sprint63-customer-portal-runtime.test.js',
  'sprint69-security-hardening-runtime.test.js',
  'sprint70-validation-integrity-runtime.test.js',
  'sprint190-rate-limiting.test.js',
  'sprint197-tenant-isolation-validation.test.js',
  'sprint717-enterprise-web-auth.test.js',
  'sprint733-real-readiness.test.js',
  'trial-marketplace.test.js',
];

let failed = 0;
for (const test of tests) {
  const result = spawnSync(process.execPath, [path.join(root, 'tests', test)], {
    cwd: root,
    env: {
      ...process.env,
      DATA_STORE: 'json',
      DATA_FILE: path.join(root, 'tmp', 'core-test-runtime.json'),
      JWT_SECRET: 'core-test-jwt-secret-core-test-jwt-secret-1234567890',
      PORTAL_TOKEN_SECRET: 'core-test-portal-secret-core-test-portal-secret',
    },
    stdio: 'inherit',
    windowsHide: true,
  });
  if (result.status !== 0) failed += 1;
}

if (failed > 0) {
  console.error(`Core suite failed: ${failed} of ${tests.length} test files failed.`);
  process.exit(1);
}
console.log(`Core suite passed: ${tests.length} test files.`);
