'use strict';

const assert = require('node:assert');

const analytics = require(
  '../scripts/lib/release-command-center-analytics',
);
const timeline = require(
  '../scripts/lib/release-command-center-timeline',
);
const audit = require(
  '../scripts/lib/release-command-center-audit',
);

function run() {
  const input = {
    environments: [
      { name: 'staging' },
      { name: 'production' },
    ],
    releases: [
      {
        releaseId: 'phase67-release',
        environment: 'production',
        deployedAt: '2026-07-19T08:00:00.000Z',
      },
    ],
    authorizations: [
      {
        recordedAt: '2026-07-19T07:00:00.000Z',
        authorization: {
          releaseId: 'phase67-release',
        },
      },
    ],
    promotions: [
      {
        authorized: true,
        evaluatedAt: '2026-07-19T07:30:00.000Z',
        targetEnvironment: 'production',
        certificate: {
          releaseId: 'phase67-release',
        },
      },
    ],
    rollouts: [
      {
        rolloutId: 'rollout-phase67',
        releaseId: 'phase67-release',
        targetEnvironment: 'production',
        state: 'completed',
        createdAt: '2026-07-19T07:35:00.000Z',
        updatedAt: '2026-07-19T08:00:00.000Z',
        history: [
          {
            at: '2026-07-19T08:00:00.000Z',
            event: 'rollout_completed',
          },
        ],
      },
    ],
    rollbacks: [],
    incidents: [],
  };

  const dashboard = {
    summary: analytics.summarizeReleases(input),
    environments: analytics.buildEnvironmentStatus(input),
    timeline: timeline.buildReleaseTimeline(input),
  };

  assert.strictEqual(
    dashboard.summary.kpis.promotionApprovalRatePercent,
    100,
  );
  assert.strictEqual(
    dashboard.environments.find(
      (item) => item.environment === 'production',
    ).health,
    'healthy',
  );
  assert.ok(dashboard.timeline.length >= 3);

  const record = audit.buildAuditRecord({
    actor: 'system',
    action: 'dashboard_generated',
    resourceType: 'release-command-center',
    resourceId: 'phase67',
    outcome: 'success',
    details: {
      timelineCount: dashboard.timeline.length,
    },
  });

  assert.strictEqual(record.outcome, 'success');

  console.log('Phase 67 integration tests passed.');
}

run();
