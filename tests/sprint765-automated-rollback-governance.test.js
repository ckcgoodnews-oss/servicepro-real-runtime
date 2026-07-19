'use strict';

const assert = require('node:assert');

const {
  ROLLBACK_STATES,
  authorizeRollback,
  buildRollbackExecution,
  evaluateRollbackTrigger,
} = require('../scripts/lib/rollback-governance-engine');

function run() {
  const trigger = evaluateRollbackTrigger({
    metrics: {
      errorRatePercent: 7,
      p95LatencyMs: 3000,
      availabilityPercent: 97,
      failedHealthChecks: 4,
    },
    policy: {
      errorRateTriggerPercent: 5,
      p95LatencyTriggerMs: 2500,
      availabilityTriggerPercent: 98,
      failedHealthCheckTrigger: 3,
      rollbackOnPausedRollout: true,
    },
    rolloutState: 'paused',
  });

  assert.strictEqual(trigger.required, true);
  assert.ok(trigger.reasons.length >= 4);

  const decision = authorizeRollback({
    trigger,
    releaseId: 'release-765',
    previousReleaseId: 'release-764',
    changeTicket: 'CHG-3001',
    operator: 'operator@example.com',
    now: '2026-07-19T01:00:00.000Z',
  });

  assert.strictEqual(decision.state, ROLLBACK_STATES.AUTHORIZED);
  assert.strictEqual(decision.authorized, true);

  const execution = buildRollbackExecution({
    authorization: decision.authorization,
    result: {
      success: true,
      deploymentReference: 'deploy-1',
      incidentReference: 'incident-1',
    },
    now: '2026-07-19T01:05:00.000Z',
  });

  assert.strictEqual(execution.state, ROLLBACK_STATES.EXECUTED);
  assert.strictEqual(execution.success, true);

  console.log('Sprint 765 automated rollback governance tests passed.');
}

run();
