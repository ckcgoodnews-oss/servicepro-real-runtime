#!/usr/bin/env node
'use strict';

const path = require('node:path');
const {
  evaluateProductionReadiness,
} = require('./lib/production-readiness-engine');
const {
  readJson,
  writeJson,
} = require('./lib/production-readiness-store');

const allowNotReady = process.argv.includes('--allow-not-ready');
const rootDir = path.resolve(__dirname, '..');

const inputPath = path.resolve(
  rootDir,
  process.env.PRODUCTION_READINESS_INPUT_PATH ||
    path.join('release-evidence', 'production-readiness-input.json'),
);
const policyPath = path.resolve(
  rootDir,
  process.env.PRODUCTION_READINESS_POLICY_PATH ||
    path.join('config', 'production', 'production-readiness-policy.json'),
);
const outputPath = path.resolve(
  rootDir,
  process.env.PRODUCTION_READINESS_REPORT_PATH ||
    path.join('release-evidence', 'production-readiness-report.json'),
);

const input = readJson(inputPath, {
  releaseId: 'local-verification',
  checks: [],
  approvals: [],
});
const policy = readJson(policyPath);

const report = evaluateProductionReadiness({
  ...input,
  policy,
});

writeJson(outputPath, report);
process.stdout.write(`${JSON.stringify({ inputPath, outputPath, report }, null, 2)}\n`);

if (!report.ready && !allowNotReady) {
  process.exitCode = 11;
}
