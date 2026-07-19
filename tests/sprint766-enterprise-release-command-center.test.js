'use strict';

const assert = require('node:assert');

const {
  buildEnvironmentStatus,
  summarizeReleases,
} = require('../scripts/lib/release-command-center-analytics');
const {
  buildReleaseTimeline,
} = require('../scripts/lib/release-command-center-timeline');
const {
  buildAuditRecord,
  filterAuditRecords,
} = require('../scripts/lib/release-command-center-audit');

function run() {
  const summary = summarizeReleases({
    releases: [{ releaseId: 'r1' }, { releaseId: 'r2' }],
    promotions: [
      { authorized: true },
      { authorized: false },
    ],
    rollouts: [
      {
        state: 'completed',
        createdAt: '2026-07-19T00:00:00.000Z',
        updatedAt: '2026-07-19T00:10:00.000Z',
      },
      { state: 'paused' },
    ],
    rollbacks: [{ success: true }],
    incidents: [{ status: 'open' }],
  });

  assert.strictEqual(
    summary.kpis.promotionApprovalRatePercent,
    50,
  );
  assert.strictEqual(
    summary.kpis.rolloutCompletionRatePercent,
    50,
  );
  assert.strictEqual(summary.kpis.openIncidentCount, 1);

  const environments = buildEnvironmentStatus({
    environments: [{ name: 'production' }],
    releases: [
      {
        releaseId: 'r2',
        environment: 'production',
        deployedAt: '2026-07-19T00:00:00.000Z',
      },
    ],
    rollouts: [
      {
        rolloutId: 'rollout-1',
        targetEnvironment: 'production',
        state: 'paused',
      },
    ],
    incidents: [],
  });

  assert.strictEqual(environments[0].health, 'degraded');

  const timeline = buildReleaseTimeline({
    authorizations: [],
    promotions: [
      {
        authorized: true,
        evaluatedAt: '2026-07-19T00:01:00.000Z',
        targetEnvironment: 'production',
        certificate: { releaseId: 'r2' },
      },
    ],
    rollouts: [],
    rollbacks: [],
    incidents: [],
  });

  assert.strictEqual(timeline.length, 1);
  assert.strictEqual(timeline[0].type, 'promotion_authorized');

  const audit = buildAuditRecord({
    actor: 'release-manager@example.com',
    action: 'promotion_approved',
    resourceType: 'release',
    resourceId: 'r2',
    outcome: 'success',
  });

  assert.strictEqual(audit.auditHash.length, 64);
  assert.strictEqual(
    filterAuditRecords([audit], {
      actor: 'release-manager@example.com',
    }).length,
    1,
  );

  console.log('Sprint 766 enterprise release command center tests passed.');
}

run();
