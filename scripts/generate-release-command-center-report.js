#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  buildEnvironmentStatus,
  summarizeReleases,
} = require('./lib/release-command-center-analytics');
const {
  buildReleaseTimeline,
} = require('./lib/release-command-center-timeline');

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  return JSON.parse(
    fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''),
  );
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    `${JSON.stringify(value, null, 2)}\n`,
    'utf8',
  );
}

const rootDir = path.resolve(__dirname, '..');
const inputPath = path.resolve(
  rootDir,
  process.env.RELEASE_COMMAND_CENTER_INPUT_PATH ||
    path.join(
      'release-evidence',
      'release-command-center-input.json',
    ),
);
const outputPath = path.resolve(
  rootDir,
  process.env.RELEASE_COMMAND_CENTER_REPORT_PATH ||
    path.join(
      'release-evidence',
      'release-command-center-report.json',
    ),
);

const input = readJson(inputPath, {
  environments: [],
  releases: [],
  authorizations: [],
  promotions: [],
  rollouts: [],
  rollbacks: [],
  incidents: [],
});

const report = {
  schemaVersion: 1,
  phase: 67,
  sprint: 766,
  generatedAt: new Date().toISOString(),
  summary: summarizeReleases(input),
  environments: buildEnvironmentStatus(input),
  timeline: buildReleaseTimeline(input),
};

writeJson(outputPath, report);
process.stdout.write(`${JSON.stringify({
  inputPath,
  outputPath,
  report,
}, null, 2)}\n`);
