const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const policy = await repos.tenantSecurity.createPolicy(tenantId, {
    name: 'Default Enterprise Security Policy',
    status: 'active',
    mfaMode: 'required_for_admins',
    sessionTimeoutMinutes: 480,
    maxConcurrentSessions: 5,
    allowPasswordLogin: true,
    requireSso: false,
    allowedIpRanges: ['10.0.0.0/8', '192.168.1.0/24'],
    blockedIpRanges: ['192.168.1.200'],
    dataResidencyRegion: 'us',
    restrictExports: true,
    restrictApiTokens: true,
    auditLogRetentionDays: 730
  });

  const decision = await repos.tenantSecurity.evaluate(tenantId, {
    userId: 'user_demo_owner',
    roles: ['owner'],
    action: 'export',
    ipAddress: '10.1.2.3',
    authMethod: 'password',
    mfaVerified: true,
    exportApproved: true
  });

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, policy, decision }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
