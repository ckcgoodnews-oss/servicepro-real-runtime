#!/usr/bin/env node
'use strict';

const path = require('node:path');
const {
  evaluateQuarantine,
} = require('./lib/release-integrity-quarantine');

const allowQuarantined = process.argv.includes('--allow-quarantined');

const result = evaluateQuarantine({
  rootDir: path.resolve(__dirname, '..'),
});

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

if (result.record.quarantined && !allowQuarantined) {
  process.exitCode = 3;
} else {
  process.exitCode = 0;
}
