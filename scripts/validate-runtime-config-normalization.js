#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function validateSnapshot(snapshot) {
  const issues = [];
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) issues.push('Normalized snapshot must be an object.');
  const configuration = Array.isArray(snapshot?.configuration) ? snapshot.configuration : [];
  if (!Array.isArray(snapshot?.configuration)) issues.push('configuration must be an array.');
  const names = configuration.map(entry => String(entry.name || ''));
  if (names.some(name => !name)) issues.push('Every configuration entry must have a name.');
  if (new Set(names).size !== names.length) issues.push('Configuration names must be unique.');
  if ([...names].sort((a, b) => a.localeCompare(b)).join('\0') !== names.join('\0')) issues.push('Configuration entries must be sorted by name.');
  for (const entry of configuration) {
    if (entry.sensitive && entry.value !== '[REDACTED]') issues.push(`${entry.name} must remain redacted.`);
    if (entry.sensitive && entry.valueHash != null && !/^[a-f0-9]{64}$/i.test(entry.valueHash)) issues.push(`${entry.name} has an invalid SHA-256 hash.`);
    if (entry.type === 'url' && entry.present) {
      try { new URL(entry.value); } catch { issues.push(`${entry.name} is not a valid URL.`); }
    }
  }
  return { ok: issues.length === 0, issues };
}

function main(argv = process.argv.slice(2)) {
  if (argv.length !== 1) {
    console.error('Usage: validate-runtime-config-normalization.js <normalized.json>');
    return 2;
  }
  const snapshot = JSON.parse(fs.readFileSync(path.resolve(argv[0]), 'utf8'));
  const result = validateSnapshot(snapshot);
  if (!result.ok) {
    for (const issue of result.issues) console.error(`Normalization validation error: ${issue}`);
    return 1;
  }
  console.log(`Runtime configuration normalization is valid (${snapshot.configuration.length} entries).`);
  return 0;
}

if (require.main === module) process.exitCode = main();

module.exports = { validateSnapshot };
