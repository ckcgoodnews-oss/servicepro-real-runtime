#!/usr/bin/env node
'use strict';

const path = require('node:path');
const {
  calculateReleaseRisk,
  shouldBlockRelease,
} = require('./lib/release-risk-engine');
const {
  readJson,
  writeJson,
} = require('./lib/release-intelligence-store');

const allowBlocked = process.argv.includes('--allow-blocked');
const rootDir = path.resolve(__dirname, '..');

const inputPath = path.resolve(
  rootDir,
  process.env.RELEASE_RISK_INPUT_PATH ||
    path.join('release-evidence', 'release-risk-input.json'),
);
const policyPath = path.resolve(
  rootDir,
  process.env.RELEASE_RISK_POLICY_PATH ||
    path.join('config', 'release', 'release-risk-policy.json'),
);
const outputPath = path.resolve(
  rootDir,
  process.env.RELEASE_RISK_REPORT_PATH ||
    path.join('release-evidence', 'release-risk-report.json'),
);

const input = readJson(inputPath, {});
const policy = readJson(policyPath);

const result = calculateReleaseRisk(input, policy);
const report = {
  ...result,
  blocked: shouldBlockRelease(result, policy),
};

writeJson(outputPath, report);
process.stdout.write(`${JSON.stringify({ inputPath, outputPath, report }, null, 2)}\n`);

if (report.blocked && !allowBlocked) {
  process.exitCode = 10;
}
