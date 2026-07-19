'use strict';

const crypto = require('node:crypto');

const ROLLBACK_STATES = Object.freeze({
  NOT_REQUIRED: 'not_required',
  REQUIRED: 'required',
  AUTHORIZED: 'authorized',
  EXECUTED: 'executed',
  BLOCKED: 'blocked',
});

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function evaluateRollbackTrigger({
  metrics,
  policy,
  rolloutState,
}) {
  const reasons = [];

  if (Number(metrics.errorRatePercent) >= Number(policy.errorRateTriggerPercent)) {
    reasons.push('error_rate_triggered');
  }

  if (Number(metrics.p95LatencyMs) >= Number(policy.p95LatencyTriggerMs)) {
    reasons.push('latency_triggered');
  }

  if (Number(metrics.availabilityPercent) <= Number(policy.availabilityTriggerPercent)) {
    reasons.push('availability_triggered');
  }

  if (Number(metrics.failedHealthChecks) >= Number(policy.failedHealthCheckTrigger)) {
    reasons.push('health_check_triggered');
  }

  if (rolloutState === 'paused' && policy.rollbackOnPausedRollout === true) {
    reasons.push('paused_rollout_triggered');
  }

  return {
    required: reasons.length > 0,
    reasons,
  };
}

function authorizeRollback({
  trigger,
  releaseId,
  previousReleaseId,
  changeTicket,
  operator,
  now = new Date().toISOString(),
}) {
  if (!trigger.required) {
    return {
      state: ROLLBACK_STATES.NOT_REQUIRED,
      authorized: false,
      reasons: [],
      authorization: null,
    };
  }

  const failures = [];

  if (!String(releaseId || '').trim()) {
    failures.push('release_id_missing');
  }

  if (!String(previousReleaseId || '').trim()) {
    failures.push('previous_release_id_missing');
  }

  if (!String(changeTicket || '').trim()) {
    failures.push('change_ticket_missing');
  }

  if (!String(operator || '').trim()) {
    failures.push('operator_missing');
  }

  if (failures.length > 0) {
    return {
      state: ROLLBACK_STATES.BLOCKED,
      authorized: false,
      reasons: failures,
      authorization: null,
    };
  }

  const rollbackId = sha256(JSON.stringify({
    releaseId,
    previousReleaseId,
    changeTicket,
    operator,
    now,
    trigger,
  }));

  return {
    state: ROLLBACK_STATES.AUTHORIZED,
    authorized: true,
    reasons: trigger.reasons,
    authorization: {
      schemaVersion: 1,
      sprint: 765,
      control: 'automated-rollback-governance',
      rollbackId,
      releaseId,
      previousReleaseId,
      changeTicket,
      operator,
      authorizedAt: now,
      triggerReasons: trigger.reasons,
    },
  };
}

function buildRollbackExecution({
  authorization,
  result,
  now = new Date().toISOString(),
}) {
  if (!authorization) {
    throw new Error('authorization is required');
  }

  return {
    schemaVersion: 1,
    sprint: 765,
    control: 'automated-rollback-governance',
    rollbackId: authorization.rollbackId,
    releaseId: authorization.releaseId,
    restoredReleaseId: authorization.previousReleaseId,
    executedAt: now,
    state: result.success
      ? ROLLBACK_STATES.EXECUTED
      : ROLLBACK_STATES.BLOCKED,
    success: result.success === true,
    deploymentReference: result.deploymentReference || null,
    incidentReference: result.incidentReference || null,
    rootCauseEvidence: result.rootCauseEvidence || null,
  };
}

module.exports = {
  ROLLBACK_STATES,
  authorizeRollback,
  buildRollbackExecution,
  evaluateRollbackTrigger,
  sha256,
};
