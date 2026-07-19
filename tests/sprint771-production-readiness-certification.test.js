'use strict';

const assert = require('node:assert');
const {
  evaluateProductionReadiness,
} = require('../scripts/lib/production-readiness-engine');

function run() {
  const policy = {
    requiredApprovalRoles: [
      'release-manager',
      'security',
      'sre',
      'product-owner',
    ],
  };

  const ready = evaluateProductionReadiness({
    releaseId: '8.0.0',
    checks: [
      {
        id: 'build',
        category: 'application',
        required: true,
        status: 'passed',
      },
      {
        id: 'security',
        category: 'security',
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
    policy,
  });

  assert.strictEqual(ready.ready, true);
  assert.ok(ready.certificate);

  const blocked = evaluateProductionReadiness({
    releaseId: '8.0.0',
    checks: [
      {
        id: 'security',
        category: 'security',
        required: true,
        status: 'failed',
      },
    ],
    approvals: [],
    policy,
  });

  assert.strictEqual(blocked.ready, false);
  assert.strictEqual(blocked.certificate, null);

  console.log('Sprint 771 production readiness certification tests passed.');
}

run();
