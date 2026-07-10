const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const asset = await repos.assetConfigCompliance.createAsset({
    tenantId,
    name: 'prod-api-01',
    assetType: 'server',
    criticality: 'high',
    owner: 'platform',
    environment: 'prod',
    hostname: 'prod-api-01',
    region: 'us-east-2',
    configuration: {
      ssh: { passwordAuth: 'yes' },
      disk: { encryption: 'disabled' },
      logging: { agentInstalled: 'true' }
    }
  });
  const activeAsset = await repos.assetConfigCompliance.activateAsset(asset.id);

  const baseline = await repos.assetConfigCompliance.createBaseline({
    tenantId,
    name: 'Linux Server Security Baseline',
    assetType: 'server',
    environment: 'prod',
    owner: 'security'
  });
  const activeBaseline = await repos.assetConfigCompliance.activateBaseline(baseline.id);

  await repos.assetConfigCompliance.createRule({
    baselineId: baseline.id,
    tenantId,
    key: 'ssh.passwordAuth',
    operator: 'eq',
    expectedValue: 'no',
    severity: 'high',
    remediationHint: 'Disable SSH password authentication.'
  });

  await repos.assetConfigCompliance.createRule({
    baselineId: baseline.id,
    tenantId,
    key: 'disk.encryption',
    operator: 'eq',
    expectedValue: 'enabled',
    severity: 'critical',
    remediationHint: 'Enable disk encryption.'
  });

  const scan = await repos.assetConfigCompliance.createScan({ tenantId, baselineId: baseline.id, requestedBy: 'security' });
  const startedScan = await repos.assetConfigCompliance.startScan(scan.id);
  const completedScan = await repos.assetConfigCompliance.runScan(scan.id);
  const findings = await repos.assetConfigCompliance.listFindings({ tenantId });

  let remediation = null;
  if (findings[0]) {
    remediation = await repos.assetConfigCompliance.createRemediation({
      findingId: findings[0].id,
      assetId: findings[0].assetId,
      tenantId,
      title: 'Remediate baseline drift',
      owner: 'platform'
    });
    remediation = await repos.assetConfigCompliance.completeRemediation(remediation.id);
  }

  const metrics = await repos.assetConfigCompliance.metrics(tenantId);
  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, asset: activeAsset, baseline: activeBaseline, scan: completedScan, startedScan, findings, remediation, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
