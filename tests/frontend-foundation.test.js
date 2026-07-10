const fs = require('fs');

const requiredFiles = [
  'apps/web/src/routes/publicRoutes.ts',
  'apps/admin/src/routes/adminRoutes.ts',
  'packages/ui/src/theme.ts',
  'packages/ui/src/components/Button.ts',
  'packages/ui/src/components/DataTable.ts',
  'packages/ui/src/components/Navigation.ts',
  'packages/database/postgres/043_frontend_metadata.sql'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 43 file: ${file}`);
    process.exit(1);
  }
}

console.log('Sprint 43 frontend foundation test passed.');
