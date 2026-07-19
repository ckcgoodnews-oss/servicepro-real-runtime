'use strict';

const assert = require('node:assert');

const {
  advanceRollout,
  createRollout,
} = require('../scripts/lib/progressive-rollout-engine');
const {
  authorizeRollback,
  evaluateRollbackTrigger,
} = require('../scripts/lib/rollback-governance-engine');

function run() {
  const created = createRollout({
    releaseId: 'phase66-release',
    strategy: 'ring',
    targetEnvironment: 'production',
    steps: [
      { trafficPercent: 10, minimumObservationMinutes: 10 },
      { trafficPercent: 100, minimumObservationMinutes: 20 },
    ],
  });

  const paused = advanceRollout({
    rollout: created.rollout,
    metrics: {
      errorRatePercent: 10,
      p95LatencyMs: 5000,
      availabilityPercent: 94,
      saturationPercent: 98,
    },
    thresholds: {
      maxErrorRatePercent: 2,
      maxP95LatencyMs: 1500,
      minAvailabilityPercent: 99,
      maxSaturationPercent: 85,
    },
  });

  assert.strictEqual(paused.state, 'paused');

  const trigger = evaluateRollbackTrigger({
    metrics: {
      errorRatePercent: 10,
      p95LatencyMs: 5000,
      availabilityPercent: 94,
      failedHealthChecks: 5,
    },
    policy: {
      errorRateTriggerPercent: 5,
      p95LatencyTriggerMs: 2500,
      availabilityTriggerPercent: 98,
      failedHealthCheckTrigger: 3,
      rollbackOnPausedRollout: true,
    },
    rolloutState: paused.state,
  });

  const decision = authorizeRollback({
    trigger,
    releaseId: 'phase66-release',
    previousReleaseId: 'phase65-release',
    changeTicket: 'CHG-3660',
    operator: 'sre@example.com',
  });

  assert.strictEqual(decision.authorized, true);
  assert.ok(decision.authorization.rollbackId);

  console.log('Phase 66 enterprise deployment automation integration tests passed.');
}

run();
