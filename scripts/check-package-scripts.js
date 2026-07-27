#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function localTargets(command) {
  const targets = [];
  const patterns = [
    /(?:^|[&|]\s*|\s)(?:node|node\.exe)\s+(?!-)(?:"([^"]+\.(?:js|cjs|mjs))"|'([^']+\.(?:js|cjs|mjs))'|([^\s&|]+\.(?:js|cjs|mjs)))/gi,
    /(?:-File)\s+(?:"([^"]+\.ps1)"|'([^']+\.ps1)'|([^\s&|]+\.ps1))/gi
  ];
  for (const pattern of patterns) {
    for (const match of command.matchAll(pattern)) targets.push(match[1] || match[2] || match[3]);
  }
  return targets;
}

function auditPackageScripts(packageFile = path.resolve('package.json')) {
  const manifest = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  const root = path.dirname(packageFile);
  const missing = [];
  for (const [name, command] of Object.entries(manifest.scripts || {})) {
    for (const target of localTargets(command)) {
      const resolved = path.resolve(root, target);
      if (!fs.existsSync(resolved)) missing.push({ name, target });
    }
  }
  return { scripts: Object.keys(manifest.scripts || {}).length, missing };
}

function main() {
  const result = auditPackageScripts();
  if (result.missing.length) {
    for (const item of result.missing) console.error(`Package script ${item.name} references missing local file ${item.target}.`);
    return 1;
  }
  console.log(`Package script integrity passed for ${result.scripts} commands.`);
  return 0;
}

if (require.main === module) process.exitCode = main();

module.exports = { auditPackageScripts, localTargets };
