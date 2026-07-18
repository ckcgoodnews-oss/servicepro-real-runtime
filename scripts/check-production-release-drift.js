#!/usr/bin/env node
'use strict';

const path = require('node:path');
const {
  runDriftDetection,
} = require('./lib/release-drift-detector');

function main() {
  const rootDir = path.resolve(__dirname, '..');
  const { report, outputPath } = runDriftDetection({ rootDir });

  const summary = {
    status: report.status,
    aligned: report.aligned,
    failClosed: report.failClosed,
    mismatches: report.mismatches,
    missingExpected: report.missingExpected,
    missingActual: report.missingActual,
    reportPath: path.relative(rootDir, outputPath),
  };

  console.log(JSON.stringify(summary, null, 2));

  if (report.aligned) {
    console.log('PRODUCTION RELEASE DRIFT CHECK PASSED');
    return;
  }

  console.error('PRODUCTION RELEASE DRIFT CHECK FAILED');
  process.exitCode = 1;
}

main();
