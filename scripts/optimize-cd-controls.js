#!/usr/bin/env node
'use strict';

const path = require('node:path');
const {
  buildControlRecommendations,
} = require('./lib/cd-control-optimizer');
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
  process.env.CD_CONTROL_OPTIMIZATION_INPUT_PATH ||
    path.join('release-evidence', 'cd-control-optimization-input.json'),
);
const outputPath = path.resolve(
  rootDir,
  process.env.CD_CONTROL_OPTIMIZATION_REPORT_PATH ||
    path.join('release-evidence', 'cd-control-optimization-report.json'),
);

const currentPolicy = readJson(policyPath);
const input = readJson(inputPath, {
  deploymentRecords: [],
  riskEvaluations: [],
  policySimulations: [],
});

const report = buildControlRecommendations({
  ...input,
  currentPolicy,
});

writeJson(outputPath, report);
process.stdout.write(`${JSON.stringify({
  inputPath,
  outputPath,
  report,
}, null, 2)}\n`);
