'use strict';

const assert = require('node:assert');
const {
  applyApprovedRecommendations,
  buildControlRecommendations,
} = require('../scripts/lib/cd-control-optimizer');

function run() {
  const policy = {
    releaseRisk: {
      blockingThreshold: 80,
    },
    promotion: {
      requiredChecks: 5,
    },
    rollout: {
      observationWindowMinutes: 15,
    },
    targets: {
      maximumFailureRate: 0.05,
      maximumRollbackRate: 0.03,
      maximumAverageRiskScore: 55,
      minimumFailureRateForRelaxation: 0.01,
      minimumRollbackRateForRelaxation: 0.005,
    },
  };

  const report = buildControlRecommendations({
    deploymentRecords: [
      { success: true, rollbackExecuted: false },
      { success: false, rollbackExecuted: true },
      { success: false, rollbackExecuted: true },
    ],
    riskEvaluations: [
      { score: 70 },
      { score: 75 },
    ],
    policySimulations: [],
    currentPolicy: policy,
  });

  assert.ok(report.recommendations.length >= 3);

  const result = applyApprovedRecommendations({
    policy,
    recommendations: report.recommendations,
    approvals: report.recommendations.map((_, index) => ({
      recommendationIndex: index,
      approved: true,
    })),
  });

  assert.ok(
    result.updatedPolicy.releaseRisk.blockingThreshold < 80,
  );
  assert.ok(
    result.updatedPolicy.rollout.observationWindowMinutes > 15,
  );

  console.log('Sprint 770 continuous delivery control optimization tests passed.');
}

run();
