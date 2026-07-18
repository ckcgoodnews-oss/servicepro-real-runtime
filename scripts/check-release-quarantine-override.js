#!/usr/bin/env node
'use strict';

const path = require('node:path');
const {
  evaluateOverride,
} = require('./lib/governed-quarantine-override');

const allowDenied = process.argv.includes('--allow-denied');

const result = evaluateOverride({
  rootDir: path.resolve(__dirname, '..'),
});

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

if (!result.record.authorized && !allowDenied) {
  process.exitCode = 4;
} else {
  process.exitCode = 0;
}
