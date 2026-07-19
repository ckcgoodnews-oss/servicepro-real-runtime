'use strict';

const assert = require('node:assert');
const {
  calculateReleaseRisk,
  shouldBlockRelease,
} = require('../scripts/lib/release-risk-engine');

function run() {
  const policy = {
    blockingThreshold: 80,
    thresholds: {
      medium: 35,
      high: 60,
      critical: 80,
    },
    targets: {
      testCoveragePercent: 85,
    },
    normalizers: {
      changeSize: 5000,
      filesChanged: 100,
      migrationCount: 10,
      failedChecks: 5,
      openIncidents: 5,
      recentRollbacks: 3,
      deploymentFrequencyPerWeek: 25,
    },
    weights: {
      changeSize: 12,
      filesChanged: 8,
      migrationCount: 12,
      coverageGap: 14,
      failedChecks: 18,
      openIncidents: 10,
      recentRollbacks: 10,
      deploymentFrequency: 4,
      productionTarget: 5,
      emergencyChange: 7,
    },
  };

  const low = calculateReleaseRisk({
    changeSize: 500,
    filesChanged: 10,
    migrationCount: 0,
    testCoveragePercent: 95,
    failedChecks: 0,
    openIncidents: 0,
    recentRollbackCount: 0,
    deploymentFrequencyPerWeek: 2,
    productionTarget: false,
    emergencyChange: false,
  }, policy);

  assert.strictEqual(low.level, 'low');
  assert.strictEqual(shouldBlockRelease(low, policy), false);

  const critical = calculateReleaseRisk({
    changeSize: 5000,
    filesChanged: 100,
    migrationCount: 10,
    testCoveragePercent: 10,
    failedChecks: 5,
    openIncidents: 5,
    recentRollbackCount: 3,
    deploymentFrequencyPerWeek: 25,
    productionTarget: true,
    emergencyChange: true,
  }, policy);

  assert.strictEqual(critical.level, 'critical');
  assert.strictEqual(shouldBlockRelease(critical, policy), true);

  console.log('Sprint 767 predictive release risk intelligence tests passed.');
}

run();
