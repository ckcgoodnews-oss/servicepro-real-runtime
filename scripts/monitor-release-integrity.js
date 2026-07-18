#!/usr/bin/env node
'use strict';

const path = require('node:path');
const {
  evaluateReleaseIntegrity,
} = require('./lib/release-integrity-monitor');

const allowDegraded = process.argv.includes('--allow-degraded');

const { result, evidencePath, statePath } = evaluateReleaseIntegrity({
  rootDir: path.resolve(__dirname, '..'),
});

process.stdout.write(`${JSON.stringify({
  ...result,
  evidencePath,
  statePath,
}, null, 2)}\n`);

if (result.health === 'healthy' || result.health === 'recovered') {
  process.exitCode = 0;
} else if (allowDegraded) {
  process.exitCode = 0;
} else {
  process.exitCode = 2;
}
