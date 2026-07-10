const fs = require('fs');
const required = ['apps/api/src/services/operationsService.js','apps/api/src/repositories/operationsRepository.js','apps/api/src/routes/operations.js','scripts/seed-operations.js','scripts/check-production-readiness.js','packages/database/postgres/100_production_hardening_runtime.sql','docs/sprint100-production-hardening-runtime.md'];
for (const file of required) { if (!fs.existsSync(file)) { console.error(`Missing required Sprint 100 patch file: ${file}`); process.exit(1); } }
const { normalizeDeploymentEnvironmentInput, normalizeReleaseManifestInput, normalizeHealthCheckInput, normalizeRunbookEntryInput, approveRelease, markReleaseDeployed, markReleaseRolledBack, calculateReadiness, buildReadinessReport, defaultProductionChecks } = require('../apps/api/src/services/operationsService');
const env = { id: 'env1', ...normalizeDeploymentEnvironmentInput({ name: 'Production', environmentType: 'production' }) };
if (env.environmentType !== 'production' || env.status !== 'active') process.exit(1);
let release = { id: 'rel1', ...normalizeReleaseManifestInput({ version: '1.0.0', environmentId: 'env1' }) };
release = approveRelease(release, 'owner'); if (release.status !== 'approved') process.exit(1);
release = markReleaseDeployed(release, 'deployer'); if (release.status !== 'deployed') process.exit(1);
release = markReleaseRolledBack(release, '0.99.0', 'deployer'); if (release.status !== 'rolled_back') process.exit(1);
const check = normalizeHealthCheckInput({ environmentId: 'env1', checkKey: 'database_connectivity', status: 'passing' }); if (check.status !== 'passing') process.exit(1);
const runbook = normalizeRunbookEntryInput({ title: 'Database unavailable', category: 'database', severity: 'critical' }); if (runbook.severity !== 'critical') process.exit(1);
const readiness = calculateReadiness([{ status: 'passing' }, { status: 'warning' }]); if (!readiness.ready || readiness.readinessStatus !== 'ready_with_warnings') process.exit(1);
const report = buildReadinessReport({ environment: env, release, checks: [check] }); if (report.environmentId !== 'env1' || report.summary.total !== 1) process.exit(1);
const defaults = defaultProductionChecks('env1', 'rel1'); if (defaults.length < 5) process.exit(1);
console.log('Sprint 100 production hardening runtime patch test passed.');
