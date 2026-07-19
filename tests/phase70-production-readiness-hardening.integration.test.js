'use strict';

const assert = require('node:assert');
const {
  evaluateProductionReadiness,
} = require('../scripts/lib/production-readiness-engine');
const {
  evaluateSecurityHardening,
} = require('../scripts/lib/security-hardening-engine');

function run() {
  const security = evaluateSecurityHardening({
    headers: {
      'content-security-policy': "default-src 'self'",
      'strict-transport-security': 'max-age=31536000',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'referrer-policy': 'strict-origin',
      'permissions-policy': 'camera=()',
    },
    configuration: {
      nodeEnv: 'production',
      trustProxy: true,
      rateLimiting: true,
      secureCookies: true,
    },
    secrets: {
      DATABASE_URL: 'configured',
      SESSION_SECRET: 'configured',
    },
    policy: {
      requiredSecrets: [
        'DATABASE_URL',
        'SESSION_SECRET',
      ],
    },
  });

  const readiness = evaluateProductionReadiness({
    releaseId: 'phase70-release',
    checks: [
      {
        id: 'security-hardening',
        category: 'security',
        required: true,
        status: security.hardened ? 'passed' : 'failed',
      },
      {
        id: 'rollback',
        category: 'rollback',
        required: true,
        status: 'passed',
      },
    ],
    approvals: [
      { role: 'release-manager', approved: true },
      { role: 'security', approved: true },
      { role: 'sre', approved: true },
      { role: 'product-owner', approved: true },
    ],
    policy: {
      requiredApprovalRoles: [
        'release-manager',
        'security',
        'sre',
        'product-owner',
      ],
    },
  });

  assert.strictEqual(security.hardened, true);
  assert.strictEqual(readiness.ready, true);

  console.log('Phase 70 integration tests passed.');
}

run();
