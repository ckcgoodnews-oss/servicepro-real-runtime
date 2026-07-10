const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const framework = await repos.complianceEvidence.createFramework(tenantId, {
    name: 'ServicePro Internal Controls',
    version: '2026.1',
    status: 'active'
  });

  const control = await repos.complianceEvidence.createControl(tenantId, {
    frameworkId: framework.id,
    controlCode: 'SP-SEC-001',
    title: 'Tenant security policy is configured',
    description: 'Tenant access policy includes MFA, IP controls, and export restrictions.',
    ownerTeam: 'platform',
    frequency: 'quarterly'
  });

  const pkg = await repos.complianceEvidence.createPackage(tenantId, {
    name: 'Q3 2026 Security Evidence',
    periodStart: '2026-07-01',
    periodEnd: '2026-09-30',
    ownerTeam: 'platform'
  });

  const item = await repos.complianceEvidence.createEvidenceItem(tenantId, {
    packageId: pkg.id,
    title: 'Tenant security policy configuration export',
    evidenceType: 'json',
    sourceSystem: 'servicepro',
    artifactUri: 's3://evidence/tenant-security-policy.json',
    collectedBy: 'system',
    status: 'accepted'
  });

  const mapping = await repos.complianceEvidence.createMapping(tenantId, {
    controlId: control.id,
    evidenceItemId: item.id,
    relevance: 'primary'
  });

  const score = await repos.complianceEvidence.score(tenantId, { frameworkId: framework.id });

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, framework, control, package: pkg, item, mapping, score }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
