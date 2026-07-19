'use strict';

const crypto = require('node:crypto');

const ROLLOUT_STRATEGIES = Object.freeze({
  CANARY: 'canary',
  BLUE_GREEN: 'blue_green',
  RING: 'ring',
});

const ROLLOUT_STATES = Object.freeze({
  PENDING: 'pending',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
});

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function normalizeStrategy(value) {
  return String(value || '').trim().toLowerCase().replace(/-/g, '_');
}

function validatePlan(plan) {
  const failures = [];
  const strategy = normalizeStrategy(plan.strategy);

  if (!Object.values(ROLLOUT_STRATEGIES).includes(strategy)) {
    failures.push('unsupported_strategy');
  }

  if (!String(plan.releaseId || '').trim()) {
    failures.push('release_id_missing');
  }

  if (!Array.isArray(plan.steps) || plan.steps.length === 0) {
    failures.push('rollout_steps_missing');
  }

  let previousTraffic = -1;
  for (const step of plan.steps || []) {
    const traffic = Number(step.trafficPercent);

    if (!Number.isFinite(traffic) || traffic < 0 || traffic > 100) {
      failures.push('invalid_traffic_percent');
      continue;
    }

    if (traffic <= previousTraffic) {
      failures.push('traffic_percent_not_increasing');
    }

    previousTraffic = traffic;

    if (!Number.isFinite(Number(step.minimumObservationMinutes))) {
      failures.push('observation_window_missing');
    }
  }

  if ((plan.steps || []).at(-1)?.trafficPercent !== 100) {
    failures.push('final_step_must_reach_100_percent');
  }

  return {
    valid: failures.length === 0,
    strategy,
    failures,
  };
}

function createRollout(plan, now = new Date().toISOString()) {
  const validation = validatePlan(plan);

  if (!validation.valid) {
    return {
      created: false,
      validation,
      rollout: null,
    };
  }

  const rolloutId = sha256(JSON.stringify({
    releaseId: plan.releaseId,
    strategy: validation.strategy,
    targetEnvironment: plan.targetEnvironment,
    createdAt: now,
  }));

  return {
    created: true,
    validation,
    rollout: {
      schemaVersion: 1,
      sprint: 764,
      control: 'progressive-rollout-orchestration',
      rolloutId,
      releaseId: plan.releaseId,
      strategy: validation.strategy,
      targetEnvironment: plan.targetEnvironment,
      state: ROLLOUT_STATES.PENDING,
      currentStepIndex: -1,
      steps: plan.steps,
      createdAt: now,
      updatedAt: now,
      history: [
        {
          at: now,
          event: 'rollout_created',
        },
      ],
    },
  };
}

function evaluateStepHealth(step, metrics, thresholds) {
  const failures = [];

  if (Number(metrics.errorRatePercent) > Number(thresholds.maxErrorRatePercent)) {
    failures.push('error_rate_exceeded');
  }

  if (Number(metrics.p95LatencyMs) > Number(thresholds.maxP95LatencyMs)) {
    failures.push('latency_threshold_exceeded');
  }

  if (Number(metrics.availabilityPercent) < Number(thresholds.minAvailabilityPercent)) {
    failures.push('availability_below_threshold');
  }

  if (Number(metrics.saturationPercent) > Number(thresholds.maxSaturationPercent)) {
    failures.push('saturation_threshold_exceeded');
  }

  return {
    healthy: failures.length === 0,
    failures,
    trafficPercent: step.trafficPercent,
  };
}

function advanceRollout({
  rollout,
  metrics,
  thresholds,
  now = new Date().toISOString(),
}) {
  if (!rollout) {
    throw new Error('rollout is required');
  }

  if (
    rollout.state === ROLLOUT_STATES.COMPLETED ||
    rollout.state === ROLLOUT_STATES.FAILED
  ) {
    return rollout;
  }

  const nextStepIndex = rollout.currentStepIndex + 1;
  const step = rollout.steps[nextStepIndex];

  if (!step) {
    return {
      ...rollout,
      state: ROLLOUT_STATES.COMPLETED,
      updatedAt: now,
      history: [
        ...rollout.history,
        {
          at: now,
          event: 'rollout_completed',
        },
      ],
    };
  }

  const health = evaluateStepHealth(step, metrics, thresholds);

  if (!health.healthy) {
    return {
      ...rollout,
      state: ROLLOUT_STATES.PAUSED,
      updatedAt: now,
      history: [
        ...rollout.history,
        {
          at: now,
          event: 'rollout_paused',
          stepIndex: nextStepIndex,
          health,
        },
      ],
    };
  }

  const completed = nextStepIndex === rollout.steps.length - 1;

  return {
    ...rollout,
    state: completed
      ? ROLLOUT_STATES.COMPLETED
      : ROLLOUT_STATES.RUNNING,
    currentStepIndex: nextStepIndex,
    updatedAt: now,
    history: [
      ...rollout.history,
      {
        at: now,
        event: completed ? 'rollout_completed' : 'rollout_advanced',
        stepIndex: nextStepIndex,
        trafficPercent: step.trafficPercent,
        health,
      },
    ],
  };
}

module.exports = {
  ROLLOUT_STATES,
  ROLLOUT_STRATEGIES,
  advanceRollout,
  createRollout,
  evaluateStepHealth,
  normalizeStrategy,
  sha256,
  validatePlan,
};
