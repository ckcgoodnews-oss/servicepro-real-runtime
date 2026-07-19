#!/usr/bin/env node
'use strict';

const path = require('node:path');
const {
  createRollout,
} = require('./lib/progressive-rollout-engine');
const {
  readJson,
  writeJson,
} = require('./lib/deployment-evidence-store');

const rootDir = path.resolve(__dirname, '..');
const requestPath = path.resolve(
  rootDir,
  process.env.RELEASE_ROLLOUT_REQUEST_PATH ||
    path.join('release-evidence', 'progressive-rollout-request.json'),
);
const outputPath = path.resolve(
  rootDir,
  process.env.RELEASE_ROLLOUT_STATE_PATH ||
    path.join('release-evidence', 'progressive-rollout-state.json'),
);

const plan = readJson(requestPath);

if (!plan) {
  throw new Error(`Rollout request missing: ${requestPath}`);
}

const result = createRollout(plan);

if (result.rollout) {
  writeJson(outputPath, result.rollout);
}

process.stdout.write(`${JSON.stringify({
  requestPath,
  outputPath,
  result,
}, null, 2)}\n`);

if (!result.created) {
  process.exitCode = 7;
}
