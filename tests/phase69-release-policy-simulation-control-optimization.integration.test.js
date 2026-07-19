'use strict';

const assert = require('node:assert');
const {
  simulatePolicyScenarios,
} = require('../scripts/lib/release-policy-simulation-engine');
const {
  buildControlRecommendations,
} = require('../scripts/lib/cd-control-optimizer');

function run() {
  const policy = {
    releaseRisk: {
      blockingThreshold: 80,
    },
    promotion: {
      requireAuthorization: true,
      requiredChecks: 5,
    },
    rollout: {
      blockPausedRollout: true,
      observationWindowMinutes: 15,
    },
    release: {
      maximumOpenIncidents: 0,
      requireChangeTicket: true,
      requireRollbackPlan: true,
    },
    targets: {
      maximumFailureRate: 0.05,
      maximumRollbackRate: 0.03,
      maximumAverageRiskScore: 55,
      minimumFailureRateForRelaxation: 0.01,
      minimumRollbackRateForRelaxation: 0.005,
    },
  };

  const simulation = simulatePolicyScenarios({
    basePolicy: policy,
    release: {
      openIncidentCount: 0,
      changeTicket: 'CHG-69',
      rollbackPlanValidated: true,
    },
    risk: { score: 50 },
    promotion: { authorized: true },
    rollout: { state: 'running' },
    scenarios: [
      {
        scenarioId: 'stable-relaxation',
        name: 'Cautious relaxation',
        changes: {
          'releaseRisk.blockingThreshold': 82,
        },
      },
    ],
  });

  const optimization = buildControlRecommendations({
    deploymentRecords: [
      { success: true, rollbackExecuted: false },
      { success: true, rollbackExecuted: false },
    ],
    riskEvaluations: [
      { score: 40 },
      { score: 45 },
    ],
    policySimulations: simulation.results,
    currentPolicy: policy,
  });

  assert.strictEqual(simulation.baseline.allowed, true);
  assert.ok(
    optimization.recommendations.some(
      (item) => item.action === 'increase_cautiously',
    ),
  );

  console.log('Phase 69 integration tests passed.');
}

run();
