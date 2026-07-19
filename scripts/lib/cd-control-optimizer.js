'use strict';

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildControlRecommendations({
  deploymentRecords = [],
  riskEvaluations = [],
  policySimulations = [],
  currentPolicy,
}) {
  const recommendations = [];

  const failureRate = deploymentRecords.length
    ? deploymentRecords.filter((item) => item.success !== true).length /
      deploymentRecords.length
    : 0;

  const rollbackRate = deploymentRecords.length
    ? deploymentRecords.filter((item) => item.rollbackExecuted === true).length /
      deploymentRecords.length
    : 0;

  const averageRisk = average(
    riskEvaluations
      .map((item) => Number(item.score))
      .filter(Number.isFinite),
  );

  const safeRelaxationCount = policySimulations.filter(
    (item) =>
      item.evaluation?.allowed === true &&
      item.delta?.failuresAdded?.length === 0,
  ).length;

  if (failureRate > currentPolicy.targets.maximumFailureRate) {
    recommendations.push({
      control: 'promotion.requiredChecks',
      action: 'increase',
      reason: 'deployment_failure_rate_above_target',
      priority: 'high',
    });
  }

  if (rollbackRate > currentPolicy.targets.maximumRollbackRate) {
    recommendations.push({
      control: 'rollout.observationWindowMinutes',
      action: 'increase',
      reason: 'rollback_rate_above_target',
      priority: 'high',
    });
  }

  if (averageRisk > currentPolicy.targets.maximumAverageRiskScore) {
    recommendations.push({
      control: 'releaseRisk.blockingThreshold',
      action: 'decrease',
      reason: 'average_release_risk_above_target',
      priority: 'medium',
    });
  }

  if (
    failureRate < currentPolicy.targets.minimumFailureRateForRelaxation &&
    rollbackRate < currentPolicy.targets.minimumRollbackRateForRelaxation &&
    safeRelaxationCount > 0
  ) {
    recommendations.push({
      control: 'releaseRisk.blockingThreshold',
      action: 'increase_cautiously',
      reason: 'stable_delivery_with_safe_simulation_results',
      priority: 'low',
    });
  }

  return {
    schemaVersion: 1,
    sprint: 770,
    control: 'continuous-delivery-control-optimization',
    generatedAt: new Date().toISOString(),
    metrics: {
      deploymentCount: deploymentRecords.length,
      failureRate: Number(failureRate.toFixed(4)),
      rollbackRate: Number(rollbackRate.toFixed(4)),
      averageRiskScore: Number(averageRisk.toFixed(2)),
      safeRelaxationCount,
    },
    recommendations,
  };
}

function applyApprovedRecommendations({
  policy,
  recommendations,
  approvals,
}) {
  const approvedIds = new Set(
    (approvals || [])
      .filter((item) => item.approved === true)
      .map((item) => item.recommendationIndex),
  );

  const updated = JSON.parse(JSON.stringify(policy));
  const applied = [];

  recommendations.forEach((recommendation, index) => {
    if (!approvedIds.has(index)) {
      return;
    }

    if (
      recommendation.control === 'releaseRisk.blockingThreshold' &&
      recommendation.action === 'decrease'
    ) {
      updated.releaseRisk.blockingThreshold = Math.max(
        1,
        Number(updated.releaseRisk.blockingThreshold) - 5,
      );
      applied.push(index);
    }

    if (
      recommendation.control === 'releaseRisk.blockingThreshold' &&
      recommendation.action === 'increase_cautiously'
    ) {
      updated.releaseRisk.blockingThreshold = Math.min(
        100,
        Number(updated.releaseRisk.blockingThreshold) + 2,
      );
      applied.push(index);
    }

    if (
      recommendation.control === 'rollout.observationWindowMinutes' &&
      recommendation.action === 'increase'
    ) {
      updated.rollout.observationWindowMinutes =
        Number(updated.rollout.observationWindowMinutes) + 5;
      applied.push(index);
    }

    if (
      recommendation.control === 'promotion.requiredChecks' &&
      recommendation.action === 'increase'
    ) {
      updated.promotion.requiredChecks =
        Number(updated.promotion.requiredChecks) + 1;
      applied.push(index);
    }
  });

  return {
    updatedPolicy: updated,
    appliedRecommendationIndexes: applied,
  };
}

module.exports = {
  applyApprovedRecommendations,
  average,
  buildControlRecommendations,
};
