const fs = require('fs');

const requiredFiles = [
  'packages/auth/src/tokenTypes.ts',
  'packages/auth/src/passwordPolicy.ts',
  'packages/auth/src/permissions.ts',
  'packages/auth/src/rbac.ts',
  'packages/auth/src/tenantContext.ts',
  'packages/auth/src/mfa.ts',
  'packages/audit/src/auditEvents.ts',
  'packages/database/postgres/040_auth_rbac_sessions.sql',
  'apps/api/src/routes/auth.routes.ts'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 40 file: ${file}`);
    process.exit(1);
  }
}

console.log('Sprint 40 auth foundation test passed.');
