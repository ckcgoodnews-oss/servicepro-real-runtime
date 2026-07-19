'use strict';

const assert = require('node:assert');

const {
  ROLLOUT_STATES,
  advanceRollout,
  createRollout,
  validatePlan,
} = require('../scripts/lib/progressive-rollout-engine');

function run() {
  const plan = {
    releaseId: 'release-764',
    strategy: 'canary',
    targetEnvironment: 'production',
    steps: [
      { trafficPercent: 5, minimumObservationMinutes: 10 },
      { trafficPercent: 25, minimumObservationMinutes: 15 },
      { trafficPercent: 100, minimumObservationMinutes: 30 },
    ],
  };

  assert.strictEqual(validatePlan(plan).valid, true);

  const created = createRollout(
    plan,
    '2026-07-19T00:00:00.000Z',
  );

  assert.strictEqual(created.created, true);
  assert.strictEqual(created.rollout.state, ROLLOUT_STATES.PENDING);

  const running = advanceRollout({
    rollout: created.rollout,
    metrics: {
      errorRatePercent: 0.5,
      p95LatencyMs: 500,
      availabilityPercent: 99.9,
      saturationPercent: 40,
    },
    thresholds: {
      maxErrorRatePercent: 2,
      maxP95LatencyMs: 1500,
      minAvailabilityPercent: 99,
      maxSaturationPercent: 85,
    },
    now: '2026-07-19T00:10:00.000Z',
  });

  assert.strictEqual(running.state, ROLLOUT_STATES.RUNNING);
  assert.strictEqual(running.currentStepIndex, 0);

  const paused = advanceRollout({
    rollout: running,
    metrics: {
      errorRatePercent: 8,
      p95LatencyMs: 4000,
      availabilityPercent: 95,
      saturationPercent: 95,
    },
    thresholds: {
      maxErrorRatePercent: 2,
      maxP95LatencyMs: 1500,
      minAvailabilityPercent: 99,
      maxSaturationPercent: 85,
    },
  });

  assert.strictEqual(paused.state, ROLLOUT_STATES.PAUSED);

  console.log('Sprint 764 progressive rollout orchestration tests passed.');
}

run();
