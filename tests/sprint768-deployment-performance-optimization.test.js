'use strict';

const assert = require('node:assert');
const {
  analyzeDeploymentPerformance,
  percentile,
} = require('../scripts/lib/deployment-optimization-engine');

function run() {
  assert.strictEqual(percentile([1, 2, 3, 4, 5], 95), 5);

  const report = analyzeDeploymentPerformance([
    {
      strategy: 'canary',
      success: true,
      durationMs: 600000,
      leadTimeMs: 36000000,
    },
    {
      strategy: 'canary',
      success: true,
      durationMs: 660000,
      leadTimeMs: 39600000,
    },
    {
      strategy: 'blue_green',
      success: false,
      durationMs: 1200000,
      leadTimeMs: 72000000,
    },
    {
      strategy: 'blue_green',
      success: true,
      durationMs: 900000,
      leadTimeMs: 54000000,
    },
  ], {
    minimumSamplesPerStrategy: 2,
    targets: {
      minimumSuccessRatePercent: 95,
      maximumP95DurationMs: 1800000,
      maximumAverageLeadTimeMs: 86400000,
    },
  });

  assert.strictEqual(report.metrics.deploymentCount, 4);
  assert.strictEqual(report.metrics.successCount, 3);
  assert.strictEqual(report.preferredStrategy.strategy, 'canary');
  assert.ok(
    report.recommendations.includes(
      'improve_predeployment_validation',
    ),
  );

  console.log('Sprint 768 deployment performance optimization tests passed.');
}

run();
