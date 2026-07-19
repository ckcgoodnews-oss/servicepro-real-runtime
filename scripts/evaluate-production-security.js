#!/usr/bin/env node
'use strict';

const path = require('node:path');
const {
  evaluateSecurityHardening,
} = require('./lib/security-hardening-engine');
const {
  readJson,
  writeJson,
} = require('./lib/production-readiness-store');

const allowFindings = process.argv.includes('--allow-findings');
const rootDir = path.resolve(__dirname, '..');

const inputPath = path.resolve(
  rootDir,
  process.env.PRODUCTION_SECURITY_INPUT_PATH ||
    path.join('release-evidence', 'production-security-input.json'),
);
const policyPath = path.resolve(
  rootDir,
  process.env.PRODUCTION_SECURITY_POLICY_PATH ||
    path.join('config', 'production', 'production-security-policy.json'),
);
const outputPath = path.resolve(
  rootDir,
  process.env.PRODUCTION_SECURITY_REPORT_PATH ||
    path.join('release-evidence', 'production-security-report.json'),
);

const input = readJson(inputPath, {
  headers: {},
  configuration: {},
  secrets: {},
});
const policy = readJson(policyPath);

const report = evaluateSecurityHardening({
  ...input,
  policy,
});

writeJson(outputPath, report);
process.stdout.write(`${JSON.stringify({ inputPath, outputPath, report }, null, 2)}\n`);

if (!report.hardened && !allowFindings) {
  process.exitCode = 12;
}
