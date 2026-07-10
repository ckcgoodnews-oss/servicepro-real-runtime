const fs = require('fs');

const required = [
  'apps/api/src/services/tenantSettingsService.js',
  'apps/api/src/repositories/tenantSettingsRepository.js',
  'apps/api/src/routes/tenantAdmin.js',
  'scripts/seed-tenant-settings.js',
  'packages/database/postgres/074_tenant_admin_runtime.sql',
  'docs/sprint74-tenant-admin-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 74 patch file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint74.json';
process.env.JWT_SECRET = 'test-secret-for-sprint-74';

const { resetRepositoriesForTest, getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const { defaultTenantSettings, isFeatureEnabled, publicTenantProfile } = require('../apps/api/src/services/tenantSettingsService');
const { permissionsForRoles, PERMISSIONS } = require('../apps/api/src/auth/permissions');

resetRepositoriesForTest();
const repos = getRepositories();
repos.store.reset();

const defaults = defaultTenantSettings('tenant_demo');
if (!defaults.features.customerPortal || defaults.currency !== 'USD') {
  console.error('Default tenant settings failed.');
  process.exit(1);
}

const updated = repos.tenantSettings.upsert('tenant_demo', {
  companyName: 'Chuck Plumbing',
  branding: { appName: 'Chuck Service' },
  features: { inventory: false }
});

if (updated.companyName !== 'Chuck Plumbing' || updated.branding.appName !== 'Chuck Service') {
  console.error('Tenant settings update failed.');
  process.exit(1);
}

if (isFeatureEnabled(updated, 'inventory')) {
  console.error('Tenant feature flag update failed.');
  process.exit(1);
}

const publicProfile = publicTenantProfile(updated);
if (publicProfile.legalName) {
  console.error('Public tenant profile leaked legalName.');
  process.exit(1);
}

const ownerPermissions = permissionsForRoles(['owner']);
if (!ownerPermissions.includes(PERMISSIONS.TENANT_SETTINGS_WRITE)) {
  console.error('Owner missing tenant settings write permission.');
  process.exit(1);
}

const managerPermissions = permissionsForRoles(['manager']);
if (managerPermissions.includes(PERMISSIONS.TENANT_SETTINGS_WRITE)) {
  console.error('Manager should not have tenant settings write permission by default.');
  process.exit(1);
}

console.log('Sprint 74 tenant admin runtime patch test passed.');
