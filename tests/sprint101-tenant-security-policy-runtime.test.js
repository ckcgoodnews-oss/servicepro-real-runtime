const fs = require('fs');

const required = [
  'apps/api/src/services/tenantSecurityService.js',
  'apps/api/src/repositories/tenantSecurityRepository.js',
  'apps/api/src/routes/tenantSecurity.js',
  'scripts/seed-tenant-security.js',
  'packages/database/postgres/101_tenant_security_policy_runtime.sql',
  'docs/sprint101-tenant-security-policy-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 101 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeTenantSecurityPolicyInput,
  ipToLong,
  ipMatchesRange,
  ipInRanges,
  isAdminRole,
  evaluateTenantAccess,
  buildPolicySummary
} = require('../apps/api/src/services/tenantSecurityService');

const policy = normalizeTenantSecurityPolicyInput({
  name: 'Enterprise Policy',
  mfaMode: 'required_for_admins',
  allowedIpRanges: ['10.0.0.0/8'],
  blockedIpRanges: ['10.1.1.10'],
  restrictExports: true,
  restrictApiTokens: true,
  dataResidencyRegion: 'us'
});

if (policy.status !== 'active' || policy.allowedIpRanges.length !== 1) {
  console.error('Policy normalization failed.');
  process.exit(1);
}

if (ipToLong('10.0.0.1') === null) {
  console.error('IP conversion failed.');
  process.exit(1);
}

if (!ipMatchesRange('10.1.2.3', '10.0.0.0/8')) {
  console.error('CIDR IP matching failed.');
  process.exit(1);
}

if (!ipInRanges('10.1.2.3', ['10.0.0.0/8'])) {
  console.error('IP range list matching failed.');
  process.exit(1);
}

if (!isAdminRole(['technician', 'manager'])) {
  console.error('Admin role detection failed.');
  process.exit(1);
}

const deniedBlockedIp = evaluateTenantAccess(policy, {
  ipAddress: '10.1.1.10',
  roles: ['technician'],
  authMethod: 'password',
  mfaVerified: false
});
if (deniedBlockedIp.result !== 'deny') {
  console.error('Blocked IP decision failed.');
  process.exit(1);
}

const challenged = evaluateTenantAccess(policy, {
  ipAddress: '10.2.3.4',
  roles: ['owner'],
  authMethod: 'password',
  mfaVerified: false
});
if (challenged.result !== 'challenge' || !challenged.challenges.includes('admin_mfa_required')) {
  console.error('MFA challenge decision failed.');
  process.exit(1);
}

const allowed = evaluateTenantAccess(policy, {
  ipAddress: '10.2.3.4',
  roles: ['owner'],
  authMethod: 'password',
  mfaVerified: true,
  action: 'export',
  exportApproved: true
});
if (allowed.result !== 'allow') {
  console.error('Allowed decision failed.');
  process.exit(1);
}

const summary = buildPolicySummary(policy);
if (summary.allowedIpRangeCount !== 1 || summary.dataResidencyRegion !== 'us') {
  console.error('Policy summary failed.');
  process.exit(1);
}

console.log('Sprint 101 tenant security policy runtime patch test passed.');
