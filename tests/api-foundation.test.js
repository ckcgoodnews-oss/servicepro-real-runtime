const fs = require('fs');

const requiredFiles = [
  'apps/api/src/http/apiError.ts',
  'apps/api/src/http/pagination.ts',
  'apps/api/src/http/validation.ts',
  'apps/api/src/routes/routeRegistry.ts',
  'apps/api/openapi/servicepro-openapi.yaml',
  'packages/types/src/api.ts',
  'packages/database/postgres/042_api_metadata.sql'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 42 file: ${file}`);
    process.exit(1);
  }
}

console.log('Sprint 42 API foundation test passed.');
