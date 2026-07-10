const fs = require('fs');

const required = [
  'apps/api/src/services/auditService.js',
  'apps/api/src/repositories/auditRepository.js',
  'apps/api/src/middleware/requestAudit.js',
  'apps/api/src/routes/audit.js',
  'packages/database/postgres/067_audit_runtime.sql'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 67 patch file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint67.json';
process.env.JWT_SECRET = 'test-secret-for-sprint-67';

const { resetRepositoriesForTest, getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const { entityAuditEvent } = require('../apps/api/src/services/auditService');
const { permissionsForRoles, PERMISSIONS } = require('../apps/api/src/auth/permissions');

resetRepositoriesForTest();
const repos = getRepositories();
repos.store.reset();

const event = entityAuditEvent({
  actorId: 'user_owner',
  actorType: 'user',
  entityType: 'job',
  entityId: 'job_demo_1',
  action: 'job.reviewed',
  metadata: { source: 'test' }
});

const saved = repos.audit.create('tenant_demo', event);
if (!saved.id || saved.entityType !== 'job') {
  console.error('Audit event create failed.');
  process.exit(1);
}

const rows = repos.audit.list('tenant_demo');
if (!rows.length) {
  console.error('Audit event list failed.');
  process.exit(1);
}

const ownerPermissions = permissionsForRoles(['owner']);
if (!ownerPermissions.includes(PERMISSIONS.AUDIT_READ)) {
  console.error('Owner missing audit.read permission.');
  process.exit(1);
}

console.log('Sprint 67 audit runtime patch test passed.');
