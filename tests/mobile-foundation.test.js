const fs = require('fs');

const requiredFiles = [
  'src/db/postgres/034_mobile_app_foundation.sql',
  'apps/mobile/app.json',
  'apps/mobile/src/api/mobileApiContract.ts',
  'src/modules/offline-queue/mutationTypes.js',
  'src/modules/push-notifications/pushTypes.js'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 34 file: ${file}`);
    process.exit(1);
  }
}

console.log('Sprint 34 mobile foundation test passed.');
