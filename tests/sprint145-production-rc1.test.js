const fs = require('fs');
const required = ['apps/api/src/services/productionRc1Service.js','apps/api/src/repositories/productionRc1Repository.js','apps/api/src/routes/productionRc1.js','scripts/seed-production-rc1.js','packages/database/postgres/145_production_rc1.sql','docs/sprint145-production-rc1.md'];
for (const file of required) { if (!fs.existsSync(file)) { console.error(`Missing required Sprint 145 patch file: ${file}`); process.exit(1); } }
const svc = require('../apps/api/src/services/productionRc1Service');

let health = svc.normalizeHealthCheckInput({ tenantId: 'tenant_demo', name: 'API Health' });
if (health.code !== 'API-HEALTH') process.exit(1);
health = svc.recordHealthResult(health, 'healthy', 'ok', 25);
if (health.status !== 'healthy') process.exit(1);

let readiness = svc.normalizeReadinessCheckInput({ tenantId: 'tenant_demo', name: 'Migration Check' });
readiness = svc.markReady(readiness, 's3://evidence/migration.json');
if (readiness.status !== 'ready') process.exit(1);

let gate = svc.normalizeReleaseGateInput({ tenantId: 'tenant_demo', name: 'Test Gate' });
gate = svc.passGate(gate, 'ci', 'passed');
if (gate.status !== 'passed') process.exit(1);
if (svc.waiveGate(svc.normalizeReleaseGateInput({ tenantId: 'tenant_demo', name: 'Waived Gate' }), 'accepted', 'owner').status !== 'waived') process.exit(1);

let deployment = svc.normalizeDeploymentAuditInput({ tenantId: 'tenant_demo', releaseVersion: '1.45.0-rc1' });
deployment = svc.startDeployment(deployment);
deployment = svc.completeDeployment(deployment, 'done');
if (deployment.status !== 'succeeded') process.exit(1);
if (svc.rollbackDeployment(svc.normalizeDeploymentAuditInput({ tenantId: 'tenant_demo', releaseVersion: '1.45.0-rc1' }), '1.44.0', 'rollback').status !== 'rolled_back') process.exit(1);

let backup = svc.normalizeBackupVerificationInput({ tenantId: 'tenant_demo', backupName: 'db-backup' });
backup = svc.verifyBackup(backup, 'platform', true);
if (backup.status !== 'verified' || backup.restoreTested !== true) process.exit(1);

let runbook = svc.activateRunbook(svc.normalizeRunbookInput({ tenantId: 'tenant_demo', title: 'Rollback Runbook', steps: ['restore'] }));
if (runbook.status !== 'active') process.exit(1);

let evidence = svc.verifyEvidence(svc.normalizeEvidenceInput({ tenantId: 'tenant_demo', title: 'RC Evidence' }), 'release');
if (evidence.status !== 'verified') process.exit(1);

if (!svc.releaseReady({ readiness: [readiness], gates: [gate], health: [health], backups: [backup] })) process.exit(1);

const metrics = svc.productionMetrics({ health: [health], readiness: [readiness], gates: [gate], deployments: [deployment], backups: [backup], runbooks: [runbook], evidence: [evidence] });
if (metrics.healthyChecks !== 1 || metrics.readyChecks !== 1 || metrics.passedGates !== 1 || metrics.successfulDeployments !== 1 || metrics.verifiedBackups !== 1 || metrics.activeRunbooks !== 1 || metrics.verifiedEvidence !== 1) process.exit(1);
console.log('Sprint 145 production RC1 patch test passed.');
