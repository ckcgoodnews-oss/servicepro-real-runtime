'use strict';

const assert = require('node:assert');

const {
  OVERRIDE_STATES,
  buildAuthorizationRecord,
  normalizeApprovals,
  validateOverride,
} = require('../scripts/lib/governed-quarantine-override');

function run() {
  const approvals = normalizeApprovals([
    {
      approver: 'Alice@example.com',
      role: 'release-manager',
      approvedAt: '2026-07-18T12:00:00.000Z',
    },
    {
      approver: 'alice@example.com',
      role: 'security',
      approvedAt: '2026-07-18T12:01:00.000Z',
    },
    {
      approver: 'Bob@example.com',
      role: 'security',
      approvedAt: '2026-07-18T12:02:00.000Z',
    },
  ]);

  assert.strictEqual(approvals.length, 2);

  const quarantineRecord = {
    quarantined: true,
    quarantineId: 'q-123',
  };

  const request = {
    quarantineId: 'q-123',
    changeTicket: 'CHG-1001',
    justification:
      'Emergency customer-impact mitigation with documented rollback.',
    expiresAt: '2026-07-19T12:00:00.000Z',
    approvals: [
      {
        approver: 'release@example.com',
        role: 'release-manager',
        approvedAt: '2026-07-18T12:00:00.000Z',
      },
      {
        approver: 'security@example.com',
        role: 'security',
        approvedAt: '2026-07-18T12:01:00.000Z',
      },
    ],
  };

  const validation = validateOverride({
    quarantineRecord,
    overrideRequest: request,
    now: new Date('2026-07-18T13:00:00.000Z'),
  });

  assert.strictEqual(validation.state, OVERRIDE_STATES.APPROVED);
  assert.strictEqual(validation.authorized, true);

  const expired = validateOverride({
    quarantineRecord,
    overrideRequest: request,
    now: new Date('2026-07-20T13:00:00.000Z'),
  });

  assert.strictEqual(expired.state, OVERRIDE_STATES.EXPIRED);
  assert.strictEqual(expired.authorized, false);

  const record = buildAuthorizationRecord({
    quarantineRecord,
    overrideRequest: request,
    validation,
    evaluatedAt: '2026-07-18T13:00:00.000Z',
  });

  assert.strictEqual(record.enforcement.allowDeployment, true);
  assert.strictEqual(record.enforcement.allowPromotion, true);
  assert.strictEqual(record.authorizationId.length, 64);

  console.log('Sprint 761 governed quarantine override tests passed.');
}

run();
