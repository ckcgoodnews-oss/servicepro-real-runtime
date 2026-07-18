'use strict';

const assert = require('node:assert');

const {
  QUARANTINE_STATES,
  buildQuarantineRecord,
  determineQuarantineState,
  shouldQuarantine,
} = require('../scripts/lib/release-integrity-quarantine');

function run() {
  assert.strictEqual(
    shouldQuarantine({
      health: 'healthy',
      releaseIntegrityStatus: 'aligned',
      failClosed: false,
    }),
    false,
  );

  assert.strictEqual(
    shouldQuarantine({
      health: 'critical',
      releaseIntegrityStatus: 'drifted',
      failClosed: true,
    }),
    true,
  );

  assert.strictEqual(
    determineQuarantineState({
      report: {
        health: 'healthy',
        releaseIntegrityStatus: 'aligned',
        failClosed: false,
      },
      previousState: null,
    }),
    QUARANTINE_STATES.CLEAR,
  );

  assert.strictEqual(
    determineQuarantineState({
      report: {
        health: 'healthy',
        releaseIntegrityStatus: 'aligned',
        failClosed: false,
      },
      previousState: {
        quarantineState: QUARANTINE_STATES.QUARANTINED,
      },
    }),
    QUARANTINE_STATES.RECOVERED,
  );

  const record = buildQuarantineRecord({
    report: {
      health: 'critical',
      releaseIntegrityStatus: 'drifted',
      failClosed: true,
      incident: {
        key: 'incident-1',
      },
      evidence: {
        expectedReleaseFingerprint: 'expected',
        actualReleaseFingerprint: 'actual',
      },
    },
    previousState: null,
    evaluatedAt: '2026-07-18T00:00:00.000Z',
  });

  assert.strictEqual(record.quarantined, true);
  assert.strictEqual(record.response.blockPromotion, true);
  assert.strictEqual(record.response.blockDeployment, true);
  assert.strictEqual(record.response.allowTrafficShift, false);
  assert.strictEqual(record.quarantineId.length, 64);

  console.log('Sprint 760 release integrity quarantine response tests passed.');
}

run();
