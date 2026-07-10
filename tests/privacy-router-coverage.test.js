const fs = require('fs');
const router = fs.readFileSync('apps/api/src/router.js', 'utf8');
const requiredPaths = [
  '/api/v1/privacy/dsars', '/api/v1/privacy/consents', '/api/v1/privacy/retention-policies',
  '/api/v1/privacy/deletion-jobs', '/api/v1/privacy/processing-activities', '/api/v1/privacy/dpias',
  '/api/v1/privacy/breaches', '/api/v1/privacy/metrics', '/api/v1/privacy/cases',
  '/api/v1/privacy/case-tasks', '/api/v1/privacy/case-communications', '/api/v1/privacy/case-metrics'
];
for (const endpoint of requiredPaths) {
  if (!router.includes(endpoint)) throw new Error(`Missing privacy router endpoint: ${endpoint}`);
}
if (!router.includes("require('./routes/privacyDsarOps')")) throw new Error('Privacy DSAR route module is not registered');
if (!router.includes("require('./routes/privacyCaseOrchestration')")) throw new Error('Privacy case route module is not registered');
console.log(`Privacy router coverage passed: ${requiredPaths.length} endpoint groups.`);
