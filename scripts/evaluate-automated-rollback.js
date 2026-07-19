#!/usr/bin/env node
'use strict';

const path = require('node:path');
const {
  authorizeRollback,
  evaluateRollbackTrigger,
} = require('./lib/rollback-governance-engine');
const {
  readJson,
  writeJson,
} = require('./lib/deployment-evidence-store');

const allowBlocked = process.argv.includes('--allow-blocked');
const rootDir = path.resolve(__dirname, '..');

const requestPath = path.resolve(
  rootDir,
  process.env.RELEASE_ROLLBACK_REQUEST_PATH ||
    path.join('release-evidence', 'rollback-request.json'),
);
const metricsPath = path.resolve(
  rootDir,
  process.env.RELEASE_ROLLOUT_METRICS_PATH ||
    path.join('release-evidence', 'progressive-rollout-metrics.json'),
);
const rolloutStatePath = path.resolve(
  rootDir,
  process.env.RELEASE_ROLLOUT_STATE_PATH ||
    path.join('release-evidence', 'progressive-rollout-state.json'),
);
const policyPath = path.resolve(
  rootDir,
  process.env.RELEASE_ROLLBACK_POLICY_PATH ||
    path.join('config', 'release', 'rollback-policy.json'),
);
const outputPath = path.resolve(
  rootDir,
  process.env.RELEASE_ROLLBACK_AUTHORIZATION_PATH ||
    path.join('release-evidence', 'rollback-authorization.json'),
);

const request = readJson(requestPath) || {};
const metrics = readJson(metricsPath) || {};
const rollout = readJson(rolloutStatePath) || {};
const policy = readJson(policyPath);

const trigger = evaluateRollbackTrigger({
  metrics,
  policy,
  rolloutState: rollout.state,
});

const decision = authorizeRollback({
  trigger,
  releaseId: request.releaseId,
  previousReleaseId: request.previousReleaseId,
  changeTicket: request.changeTicket,
  operator: request.operator,
});

writeJson(outputPath, {
  trigger,
  decision,
});

process.stdout.write(`${JSON.stringify({
  outputPath,
  trigger,
  decision,
}, null, 2)}\n`);

if (
  trigger.required &&
  decision.authorized !== true &&
  !allowBlocked
) {
  process.exitCode = 9;
}
