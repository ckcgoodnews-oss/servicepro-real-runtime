'use strict';

function normalizeEvent({
  source,
  type,
  at,
  releaseId = null,
  environment = null,
  title,
  details = {},
}) {
  return {
    source,
    type,
    at,
    releaseId,
    environment,
    title,
    details,
  };
}

function buildReleaseTimeline({
  authorizations = [],
  promotions = [],
  rollouts = [],
  rollbacks = [],
  incidents = [],
}) {
  const events = [];

  for (const item of authorizations) {
    events.push(
      normalizeEvent({
        source: 'authorization',
        type: 'authorization_recorded',
        at: item.recordedAt || item.authorizedAt,
        releaseId:
          item.authorization?.releaseId ||
          item.releaseId ||
          null,
        title: 'Release authorization recorded',
        details: item,
      }),
    );
  }

  for (const item of promotions) {
    events.push(
      normalizeEvent({
        source: 'promotion',
        type: item.authorized
          ? 'promotion_authorized'
          : 'promotion_denied',
        at: item.evaluatedAt,
        releaseId: item.certificate?.releaseId || item.releaseId || null,
        environment: item.targetEnvironment,
        title: item.authorized
          ? 'Promotion authorized'
          : 'Promotion denied',
        details: item,
      }),
    );
  }

  for (const item of rollouts) {
    for (const history of item.history || []) {
      events.push(
        normalizeEvent({
          source: 'rollout',
          type: history.event,
          at: history.at,
          releaseId: item.releaseId,
          environment: item.targetEnvironment,
          title: history.event.replace(/_/g, ' '),
          details: {
            rolloutId: item.rolloutId,
            ...history,
          },
        }),
      );
    }
  }

  for (const item of rollbacks) {
    events.push(
      normalizeEvent({
        source: 'rollback',
        type: item.success
          ? 'rollback_executed'
          : 'rollback_failed',
        at: item.executedAt,
        releaseId: item.releaseId,
        environment: item.environment || null,
        title: item.success
          ? 'Rollback executed'
          : 'Rollback failed',
        details: item,
      }),
    );
  }

  for (const item of incidents) {
    events.push(
      normalizeEvent({
        source: 'incident',
        type: `incident_${item.status || 'opened'}`,
        at: item.updatedAt || item.createdAt,
        releaseId: item.releaseId || null,
        environment: item.environment || null,
        title: item.title || 'Release incident',
        details: item,
      }),
    );
  }

  return events.sort(
    (a, b) => Date.parse(b.at || 0) - Date.parse(a.at || 0),
  );
}

module.exports = {
  buildReleaseTimeline,
  normalizeEvent,
};
