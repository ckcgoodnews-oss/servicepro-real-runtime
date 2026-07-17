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
  const checks = ['healthCheckPath: /readyz', 'NEXT_PUBLIC_API_BASE_URL', 'buildCommand:', 'startCommand:'];
  for (const check of checks) if (!text.includes(check)) failures.push(`render.yaml missing ${check}`);
}
if (fs.existsSync(dockerPath)) {
  const text = fs.readFileSync(dockerPath, 'utf8');
  for (const check of ['HEALTHCHECK', 'apps/api/src/server.js']) if (!text.includes(check)) failures.push(`Dockerfile missing ${check}`);
}
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('Render deployment configuration verified.');
