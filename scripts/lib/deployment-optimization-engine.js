'use strict';

function average(values) {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentile(values, percentileValue) {
  if (!values.length) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentileValue / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

function analyzeDeploymentPerformance(records = [], policy) {
  const successful = records.filter((item) => item.success === true);
  const failed = records.filter((item) => item.success !== true);
  const durations = successful
    .map((item) => Number(item.durationMs))
    .filter(Number.isFinite);
  const leadTimes = successful
    .map((item) => Number(item.leadTimeMs))
    .filter(Number.isFinite);

  const metrics = {
    deploymentCount: records.length,
    successCount: successful.length,
    failureCount: failed.length,
    successRatePercent: records.length
      ? Number(((successful.length / records.length) * 100).toFixed(2))
      : 0,
    averageDurationMs: Math.round(average(durations)),
    p95DurationMs: Math.round(percentile(durations, 95)),
    averageLeadTimeMs: Math.round(average(leadTimes)),
  };

  const recommendations = [];

  if (metrics.successRatePercent < policy.targets.minimumSuccessRatePercent) {
    recommendations.push('improve_predeployment_validation');
  }

  if (metrics.p95DurationMs > policy.targets.maximumP95DurationMs) {
    recommendations.push('optimize_deployment_pipeline_duration');
  }

  if (metrics.averageLeadTimeMs > policy.targets.maximumAverageLeadTimeMs) {
    recommendations.push('reduce_change_lead_time');
  }

  const grouped = new Map();
  for (const item of records) {
    const key = item.strategy || 'unknown';
    const bucket = grouped.get(key) || [];
    bucket.push(item);
    grouped.set(key, bucket);
  }

  const strategyPerformance = [...grouped.entries()].map(([strategy, items]) => {
    const strategySuccessful = items.filter((item) => item.success === true);
    const strategyDurations = strategySuccessful
      .map((item) => Number(item.durationMs))
      .filter(Number.isFinite);

    return {
      strategy,
      deploymentCount: items.length,
      successRatePercent: items.length
        ? Number(((strategySuccessful.length / items.length) * 100).toFixed(2))
        : 0,
      averageDurationMs: Math.round(average(strategyDurations)),
    };
  });

  const preferredStrategy = strategyPerformance
    .filter((item) => item.deploymentCount >= policy.minimumSamplesPerStrategy)
    .sort((a, b) => {
      if (b.successRatePercent !== a.successRatePercent) {
        return b.successRatePercent - a.successRatePercent;
      }
      return a.averageDurationMs - b.averageDurationMs;
    })[0] || null;

  return {
    schemaVersion: 1,
    sprint: 768,
    control: 'deployment-performance-optimization',
    generatedAt: new Date().toISOString(),
    metrics,
    strategyPerformance,
    preferredStrategy,
    recommendations,
  };
}

module.exports = {
  analyzeDeploymentPerformance,
  average,
  percentile,
};
