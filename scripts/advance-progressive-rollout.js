#!/usr/bin/env node
'use strict';

const path = require('node:path');
const {
  advanceRollout,
} = require('./lib/progressive-rollout-engine');
const {
  readJson,
  writeJson,
} = require('./lib/deployment-evidence-store');

const allowPaused = process.argv.includes('--allow-paused');
const rootDir = path.resolve(__dirname, '..');

const statePath = path.resolve(
  rootDir,
  process.env.RELEASE_ROLLOUT_STATE_PATH ||
    path.join('release-evidence', 'progressive-rollout-state.json'),
);
const metricsPath = path.resolve(
  rootDir,
  process.env.RELEASE_ROLLOUT_METRICS_PATH ||
    path.join('release-evidence', 'progressive-rollout-metrics.json'),
);
const thresholdPath = path.resolve(
  rootDir,
  process.env.RELEASE_ROLLOUT_POLICY_PATH ||
    path.join('config', 'release', 'rollout-policy.json'),
);

const rollout = readJson(statePath);
const metrics = readJson(metricsPath);
const thresholds = readJson(thresholdPath)?.healthThresholds;

if (!rollout || !metrics || !thresholds) {
  throw new Error('Rollout state, metrics, and thresholds are required.');
}

const updated = advanceRollout({
  rollout,
  metrics,
  thresholds,
});

writeJson(statePath, updated);
process.stdout.write(`${JSON.stringify({
  statePath,
  updated,
}, null, 2)}\n`);

if (updated.state === 'paused' && !allowPaused) {
  process.exitCode = 8;
}
