'use strict';

const assert = require('node:assert');
const {
  applyScenario,
  evaluatePolicy,
  simulatePolicyScenarios,
} = require('../scripts/lib/release-policy-simulation-engine');

function run() {
  const basePolicy = {
    releaseRisk: { blockingThreshold: 80 },
    promotion: { requireAuthorization: true },
    rollout: { blockPausedRollout: true },
    release: {
      maximumOpenIncidents: 0,
      requireChangeTicket: true,
      requireRollbackPlan: true,
    },
  };

  const changed = applyScenario(basePolicy, {
    'releaseRisk.blockingThreshold': 90,
  });

  assert.strictEqual(
    changed.releaseRisk.blockingThreshold,
    90,
  );
  assert.strictEqual(
    basePolicy.releaseRisk.blockingThreshold,
    80,
  );

  const denied = evaluatePolicy({
    policy: basePolicy,
    release: {
      openIncidentCount: 1,
      changeTicket: '',
      rollbackPlanValidated: false,
    },
    risk: { score: 85 },
    promotion: { authorized: false },
    rollout: { state: 'paused' },
  });

  assert.strictEqual(denied.allowed, false);
  assert.ok(denied.failures.length >= 6);

  const simulation = simulatePolicyScenarios({
    basePolicy,
    release: {
      openIncidentCount: 0,
      changeTicket: 'CHG-1',
      rollbackPlanValidated: true,
    },
    risk: { score: 82 },
    promotion: { authorized: true },
    rollout: { state: 'running' },
    scenarios: [
      {
        scenarioId: 'raise-threshold',
        name: 'Raise threshold',
        changes: {
          'releaseRisk.blockingThreshold': 85,
        },
      },
    ],
  });

  assert.strictEqual(simulation.baseline.allowed, false);
  assert.strictEqual(
    simulation.results[0].evaluation.allowed,
    true,
  );

  console.log('Sprint 769 release policy simulation tests passed.');
}

run();
