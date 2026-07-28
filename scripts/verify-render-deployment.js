#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const renderPath = path.join(root, 'render.yaml');
const dockerPath = path.join(root, 'Dockerfile');
const failures = [];
if (!fs.existsSync(renderPath)) failures.push('render.yaml missing');
if (!fs.existsSync(dockerPath)) failures.push('Dockerfile missing');
if (fs.existsSync(renderPath)) {
  const text = fs.readFileSync(renderPath, 'utf8');
  const checks = ['healthCheckPath: /readyz', 'NEXT_PUBLIC_API_BASE_URL', 'buildCommand:', 'startCommand: npm run migrate && npm start', 'DATA_STORE', 'value: postgres'];
  for (const check of checks) if (!text.includes(check)) failures.push(`render.yaml missing ${check}`);
  if (text.includes('preDeployCommand:')) failures.push('render.yaml uses preDeployCommand, which is unavailable on free services');
  const freePlans = text.match(/^\s+plan:\s+free\s*$/gm) || [];
  if (freePlans.length !== 3) failures.push(`render.yaml must define exactly three free plans; found ${freePlans.length}`);
  for (const paidPlan of ['plan: starter', 'plan: basic-256mb']) {
    if (text.includes(paidPlan)) failures.push(`render.yaml includes paid plan ${paidPlan}`);
  }
}
if (fs.existsSync(dockerPath)) {
  const text = fs.readFileSync(dockerPath, 'utf8');
  for (const check of ['HEALTHCHECK', 'apps/api/src/server.js']) if (!text.includes(check)) failures.push(`Dockerfile missing ${check}`);
}
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('Render deployment configuration verified.');
