const fs = require('fs');

const requiredFiles = [
  'packages/database/src/client.ts',
  'packages/database/src/tenantRepository.ts',
  'packages/database/src/migrations.ts',
  'packages/database/src/seeds.ts',
  'packages/database/src/repositories/customersRepository.ts',
  'packages/database/src/repositories/jobsRepository.ts',
  'packages/database/postgres/041_database_foundation.sql',
  'packages/database/schema/schemaIndex.json'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 41 file: ${file}`);
    process.exit(1);
  }
}

console.log('Sprint 41 database foundation test passed.');
