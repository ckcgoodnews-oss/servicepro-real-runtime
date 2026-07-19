'use strict';

const assert = require('node:assert');
const {
  calculateReleaseRisk,
} = require('../scripts/lib/release-risk-engine');
const {
  analyzeDeploymentPerformance,
} = require('../scripts/lib/deployment-optimization-engine');

function run() {
  const risk = calculateReleaseRisk({
    changeSize: 1000,
    filesChanged: 20,
    migrationCount: 2,
    testCoveragePercent: 90,
    failedChecks: 0,
    openIncidents: 0,
    recentRollbackCount: 0,
    deploymentFrequencyPerWeek: 5,
    productionTarget: true,
    emergencyChange: false,
  }, {
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
  });

  const optimization = analyzeDeploymentPerformance([
    {
      strategy: 'canary',
      success: true,
      durationMs: 600000,
      leadTimeMs: 36000000,
    },
    {
      strategy: 'canary',
      success: true,
      durationMs: 650000,
      leadTimeMs: 37000000,
    },
  ], {
    minimumSamplesPerStrategy: 2,
    targets: {
      minimumSuccessRatePercent: 95,
      maximumP95DurationMs: 1800000,
      maximumAverageLeadTimeMs: 86400000,
    },
  });

  assert.ok(risk.score < 80);
  assert.strictEqual(
    optimization.preferredStrategy.strategy,
    'canary',
  );

  console.log('Phase 68 integration tests passed.');
}

run();
