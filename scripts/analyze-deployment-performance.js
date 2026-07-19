#!/usr/bin/env node
'use strict';

const path = require('node:path');
const {
  analyzeDeploymentPerformance,
} = require('./lib/deployment-optimization-engine');
const {
  readJson,
  writeJson,
} = require('./lib/release-intelligence-store');

const rootDir = path.resolve(__dirname, '..');

const inputPath = path.resolve(
  rootDir,
  process.env.DEPLOYMENT_PERFORMANCE_INPUT_PATH ||
    path.join('release-evidence', 'deployment-performance-input.json'),
);
const policyPath = path.resolve(
  rootDir,
  process.env.DEPLOYMENT_OPTIMIZATION_POLICY_PATH ||
    path.join(
      'config',
      'release',
      'deployment-optimization-policy.json',
    ),
);
const outputPath = path.resolve(
  rootDir,
  process.env.DEPLOYMENT_PERFORMANCE_REPORT_PATH ||
    path.join('release-evidence', 'deployment-performance-report.json'),
);

const records = readJson(inputPath, []);
const policy = readJson(policyPath);
const report = analyzeDeploymentPerformance(records, policy);

writeJson(outputPath, report);
process.stdout.write(`${JSON.stringify({ inputPath, outputPath, report }, null, 2)}\n`);
