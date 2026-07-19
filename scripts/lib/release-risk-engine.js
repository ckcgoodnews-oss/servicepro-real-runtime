'use strict';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function calculateReleaseRisk({
  changeSize = 0,
  filesChanged = 0,
  migrationCount = 0,
  testCoveragePercent = 0,
  failedChecks = 0,
  openIncidents = 0,
  recentRollbackCount = 0,
  deploymentFrequencyPerWeek = 0,
  productionTarget = false,
  emergencyChange = false,
}, policy) {
  const weights = policy.weights;
  const factors = {
    changeSize: clamp(number(changeSize) / policy.normalizers.changeSize, 0, 1),
    filesChanged: clamp(number(filesChanged) / policy.normalizers.filesChanged, 0, 1),
    migrationCount: clamp(number(migrationCount) / policy.normalizers.migrationCount, 0, 1),
    coverageGap: clamp(
      (policy.targets.testCoveragePercent - number(testCoveragePercent)) /
        policy.targets.testCoveragePercent,
      0,
      1,
    ),
    failedChecks: clamp(number(failedChecks) / policy.normalizers.failedChecks, 0, 1),
    openIncidents: clamp(number(openIncidents) / policy.normalizers.openIncidents, 0, 1),
    recentRollbacks: clamp(
      number(recentRollbackCount) / policy.normalizers.recentRollbacks,
      0,
      1,
    ),
    deploymentFrequency: clamp(
      number(deploymentFrequencyPerWeek) /
        policy.normalizers.deploymentFrequencyPerWeek,
      0,
      1,
    ),
    productionTarget: productionTarget ? 1 : 0,
    emergencyChange: emergencyChange ? 1 : 0,
  };

  const weightedScore =
    factors.changeSize * weights.changeSize +
    factors.filesChanged * weights.filesChanged +
    factors.migrationCount * weights.migrationCount +
    factors.coverageGap * weights.coverageGap +
    factors.failedChecks * weights.failedChecks +
    factors.openIncidents * weights.openIncidents +
    factors.recentRollbacks * weights.recentRollbacks +
    factors.deploymentFrequency * weights.deploymentFrequency +
    factors.productionTarget * weights.productionTarget +
    factors.emergencyChange * weights.emergencyChange;

  const score = Math.round(clamp(weightedScore, 0, 100));

  let level = 'low';
  if (score >= policy.thresholds.critical) {
    level = 'critical';
  } else if (score >= policy.thresholds.high) {
    level = 'high';
  } else if (score >= policy.thresholds.medium) {
    level = 'medium';
  }

  const recommendations = [];

  if (factors.coverageGap > 0.2) {
    recommendations.push('increase_test_coverage');
  }

  if (factors.migrationCount > 0.5) {
    recommendations.push('perform_database_rehearsal');
  }

  if (factors.failedChecks > 0) {
    recommendations.push('resolve_failed_checks');
  }

  if (factors.openIncidents > 0) {
    recommendations.push('stabilize_open_incidents');
  }

  if (factors.recentRollbacks > 0) {
    recommendations.push('review_recent_rollback_causes');
  }

  if (emergencyChange) {
    recommendations.push('require_emergency_change_review');
  }

  return {
    schemaVersion: 1,
    sprint: 767,
    control: 'predictive-release-risk-intelligence',
    evaluatedAt: new Date().toISOString(),
    score,
    level,
    factors,
    recommendations,
  };
}

function shouldBlockRelease(result, policy) {
  return result.score >= policy.blockingThreshold;
}

module.exports = {
  calculateReleaseRisk,
  clamp,
  shouldBlockRelease,
};
