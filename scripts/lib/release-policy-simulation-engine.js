'use strict';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function applyScenario(basePolicy, changes = {}) {
  const policy = clone(basePolicy);

  for (const [path, value] of Object.entries(changes)) {
    const parts = path.split('.');
    let current = policy;

    for (let index = 0; index < parts.length - 1; index += 1) {
      const part = parts[index];

      if (
        !current[part] ||
        typeof current[part] !== 'object' ||
        Array.isArray(current[part])
      ) {
        current[part] = {};
      }

      current = current[part];
    }

    current[parts.at(-1)] = value;
  }

  return policy;
}

function evaluatePolicy({
  policy,
  release,
  risk,
  promotion,
  rollout,
}) {
  const failures = [];

  if (
    Number(risk.score) >=
    Number(policy.releaseRisk?.blockingThreshold ?? 100)
  ) {
    failures.push('release_risk_threshold_exceeded');
  }

  if (
    promotion.authorized !== true &&
    policy.promotion?.requireAuthorization !== false
  ) {
    failures.push('promotion_authorization_missing');
  }

  if (
    rollout.state === 'paused' &&
    policy.rollout?.blockPausedRollout !== false
  ) {
    failures.push('rollout_paused');
  }

  if (
    Number(release.openIncidentCount || 0) >
    Number(policy.release?.maximumOpenIncidents ?? 0)
  ) {
    failures.push('open_incident_limit_exceeded');
  }

  if (
    policy.release?.requireChangeTicket === true &&
    !String(release.changeTicket || '').trim()
  ) {
    failures.push('change_ticket_missing');
  }

  if (
    policy.release?.requireRollbackPlan === true &&
    release.rollbackPlanValidated !== true
  ) {
    failures.push('rollback_plan_missing');
  }

  return {
    allowed: failures.length === 0,
    failures,
  };
}

function simulatePolicyScenarios({
  basePolicy,
  scenarios,
  release,
  risk,
  promotion,
  rollout,
}) {
  const baseline = evaluatePolicy({
    policy: basePolicy,
    release,
    risk,
    promotion,
    rollout,
  });

  const results = (scenarios || []).map((scenario) => {
    const policy = applyScenario(
      basePolicy,
      scenario.changes || {},
    );

    const evaluation = evaluatePolicy({
      policy,
      release,
      risk,
      promotion,
      rollout,
    });

    return {
      scenarioId: scenario.scenarioId,
      name: scenario.name,
      changes: scenario.changes || {},
      evaluation,
      delta: {
        allowedChanged:
          evaluation.allowed !== baseline.allowed,
        failuresAdded: evaluation.failures.filter(
          (failure) => !baseline.failures.includes(failure),
        ),
        failuresRemoved: baseline.failures.filter(
          (failure) => !evaluation.failures.includes(failure),
        ),
      },
    };
  });

  return {
    schemaVersion: 1,
    sprint: 769,
    control: 'release-policy-simulation',
    simulatedAt: new Date().toISOString(),
    baseline,
    results,
  };
}

module.exports = {
  applyScenario,
  clone,
  evaluatePolicy,
  simulatePolicyScenarios,
};
