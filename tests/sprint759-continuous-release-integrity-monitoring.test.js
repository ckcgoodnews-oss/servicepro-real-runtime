'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  HEALTH_STATES,
  buildIncidentKey,
  determineHealth,
} = require('../scripts/lib/release-integrity-monitor');

function run() {
  assert.strictEqual(
    determineHealth({ currentStatus: 'aligned', previousStatus: 'aligned' }),
    HEALTH_STATES.HEALTHY,
  );

  assert.strictEqual(
    determineHealth({ currentStatus: 'aligned', previousStatus: 'drifted' }),
    HEALTH_STATES.RECOVERED,
  );

  assert.strictEqual(
    determineHealth({ currentStatus: 'drifted', previousStatus: 'aligned' }),
    HEALTH_STATES.CRITICAL,
  );

  assert.strictEqual(
    determineHealth({ currentStatus: 'unknown', previousStatus: 'aligned' }),
    HEALTH_STATES.DEGRADED,
  );

  const report = {
    control: 'production-release-drift-detection',
    status: 'drifted',
    mismatches: ['sourceCommit'],
    missingExpected: [],
    missingActual: [],
    expectedReleaseFingerprint: 'expected',
    actualReleaseFingerprint: 'actual',
  };

  const first = buildIncidentKey(report);
  const second = buildIncidentKey({ ...report });
  assert.strictEqual(first, second);
  assert.strictEqual(first.length, 64);

  const changed = buildIncidentKey({
    ...report,
    mismatches: ['artifactDigest'],
  });
  assert.notStrictEqual(first, changed);

  console.log('Sprint 759 continuous release integrity monitoring tests passed.');
}

run();
