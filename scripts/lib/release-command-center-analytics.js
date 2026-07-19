'use strict';

function percent(numerator, denominator) {
  if (!denominator) {
    return 0;
  }

  return Number(((numerator / denominator) * 100).toFixed(2));
}

function durationMs(start, end) {
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
    return null;
  }

  return Math.max(0, endMs - startMs);
}

function summarizeReleases({
  releases = [],
  promotions = [],
  rollouts = [],
  rollbacks = [],
  incidents = [],
}) {
  const completedRollouts = rollouts.filter(
    (item) => item.state === 'completed',
  );
  const pausedRollouts = rollouts.filter(
    (item) => item.state === 'paused',
  );
  const authorizedPromotions = promotions.filter(
    (item) => item.authorized === true,
  );
  const deniedPromotions = promotions.filter(
    (item) => item.authorized === false,
  );
  const successfulRollbacks = rollbacks.filter(
    (item) => item.success === true,
  );
  const openIncidents = incidents.filter(
    (item) => !['resolved', 'closed'].includes(item.status),
  );

  const deploymentDurations = completedRollouts
    .map((item) => durationMs(item.createdAt, item.updatedAt))
    .filter((value) => value !== null);

  const averageDeploymentDurationMs = deploymentDurations.length
    ? Math.round(
        deploymentDurations.reduce((sum, value) => sum + value, 0) /
          deploymentDurations.length,
      )
    : 0;

  return {
    schemaVersion: 1,
    sprint: 766,
    control: 'enterprise-release-command-center',
    generatedAt: new Date().toISOString(),
    totals: {
      releases: releases.length,
      promotions: promotions.length,
      rollouts: rollouts.length,
      rollbacks: rollbacks.length,
      incidents: incidents.length,
    },
    kpis: {
      promotionApprovalRatePercent: percent(
        authorizedPromotions.length,
        promotions.length,
      ),
      promotionDenialRatePercent: percent(
        deniedPromotions.length,
        promotions.length,
      ),
      rolloutCompletionRatePercent: percent(
        completedRollouts.length,
        rollouts.length,
      ),
      rolloutPauseRatePercent: percent(
        pausedRollouts.length,
        rollouts.length,
      ),
      rollbackSuccessRatePercent: percent(
        successfulRollbacks.length,
        rollbacks.length,
      ),
      averageDeploymentDurationMs,
      openIncidentCount: openIncidents.length,
    },
  };
}

function buildEnvironmentStatus({
  environments = [],
  releases = [],
  rollouts = [],
  incidents = [],
}) {
  return environments.map((environment) => {
    const release = releases
      .filter(
        (item) => item.environment === environment.name,
      )
      .sort(
        (a, b) =>
          Date.parse(b.deployedAt || 0) -
          Date.parse(a.deployedAt || 0),
      )[0] || null;

    const activeRollout = rollouts.find(
      (item) =>
        item.targetEnvironment === environment.name &&
        ['pending', 'running', 'paused'].includes(item.state),
    ) || null;

    const openIncidents = incidents.filter(
      (item) =>
        item.environment === environment.name &&
        !['resolved', 'closed'].includes(item.status),
    );

    let health = 'healthy';

    if (openIncidents.some((item) => item.severity === 'critical')) {
      health = 'critical';
    } else if (activeRollout?.state === 'paused' || openIncidents.length > 0) {
      health = 'degraded';
    }

    return {
      environment: environment.name,
      health,
      currentReleaseId: release?.releaseId || null,
      deployedAt: release?.deployedAt || null,
      activeRolloutId: activeRollout?.rolloutId || null,
      activeRolloutState: activeRollout?.state || null,
      openIncidentCount: openIncidents.length,
    };
  });
}

module.exports = {
  buildEnvironmentStatus,
  durationMs,
  percent,
  summarizeReleases,
};
