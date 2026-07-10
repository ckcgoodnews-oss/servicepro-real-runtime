const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const health = await repos.productionRc1.createHealthCheck({ tenantId, name: 'API Health', component: 'api' });
  const healthy = await repos.productionRc1.recordHealthResult(health.id, 'healthy', 'API responded normally.', 42);

  const readiness = await repos.productionRc1.createReadinessCheck({ tenantId, name: 'Migration Verification', owner: 'platform', required: true });
  const ready = await repos.productionRc1.markReady(readiness.id, 's3://evidence/migration-verification.json');

  const gate = await repos.productionRc1.createReleaseGate({ tenantId, name: 'Automated Test Gate', category: 'quality', required: true });
  const passedGate = await repos.productionRc1.passGate(gate.id, 'ci', 'All RC1 tests passed.');

  const backup = await repos.productionRc1.createBackup({ tenantId, backupName: 'prod-db-rc1-backup', backupType: 'database', storageLocation: 's3://backups/prod-db-rc1.snapshot' });
  const verifiedBackup = await repos.productionRc1.verifyBackup(backup.id, 'platform', true);

  const runbook = await repos.productionRc1.createRunbook({ tenantId, title: 'Production Rollback Runbook', category: 'deployment', owner: 'platform', steps: ['Stop deployment', 'Restore previous image', 'Verify health'] });
  const activeRunbook = await repos.productionRc1.activateRunbook(runbook.id);

  const evidence = await repos.productionRc1.createEvidence({ tenantId, title: 'RC1 Release Evidence Bundle', evidenceType: 'release', fileUrl: 's3://evidence/rc1-bundle.zip', collectedBy: 'ci' });
  const verifiedEvidence = await repos.productionRc1.verifyEvidence(evidence.id, 'release-manager');

  const deployment = await repos.productionRc1.createDeployment({ tenantId, releaseVersion: '1.45.0-rc1', environment: 'production', requestedBy: 'release-manager', approvedBy: 'owner', commitSha: 'RC1_DEMO_SHA', artifactUrl: 's3://artifacts/servicepro-1.45.0-rc1.zip' });
  const running = await repos.productionRc1.startDeployment(deployment.id);
  const completed = await repos.productionRc1.completeDeployment(deployment.id, 'RC1 deployment completed.');

  const releaseReady = await repos.productionRc1.releaseReady(tenantId);
  const metrics = await repos.productionRc1.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, health: healthy, readiness: ready, gate: passedGate, backup: verifiedBackup, runbook: activeRunbook, evidence: verifiedEvidence, deployment: completed, running, releaseReady, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
