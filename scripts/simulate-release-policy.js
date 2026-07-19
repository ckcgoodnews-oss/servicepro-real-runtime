#!/usr/bin/env node
'use strict';

const path = require('node:path');
const {
  simulatePolicyScenarios,
} = require('./lib/release-policy-simulation-engine');
const {
  readJson,
  writeJson,
} = require('./lib/release-policy-store');

const rootDir = path.resolve(__dirname, '..');
const policyPath = path.resolve(
  rootDir,
  process.env.RELEASE_POLICY_BASE_PATH ||
    path.join('config', 'release', 'delivery-control-policy.json'),
);
const inputPath = path.resolve(
  rootDir,
  process.env.RELEASE_POLICY_SIMULATION_INPUT_PATH ||
    path.join('release-evidence', 'release-policy-simulation-input.json'),
);
const outputPath = path.resolve(
  rootDir,
  process.env.RELEASE_POLICY_SIMULATION_REPORT_PATH ||
    path.join('release-evidence', 'release-policy-simulation-report.json'),
);

const basePolicy = readJson(policyPath);
const input = readJson(inputPath, {
  scenarios: [],
  release: {},
  risk: {},
  promotion: {},
  rollout: {},
});

const report = simulatePolicyScenarios({
  basePolicy,
  ...input,
});

writeJson(outputPath, report);
process.stdout.write(`${JSON.stringify({
  inputPath,
  outputPath,
  report,
}, null, 2)}\n`);
