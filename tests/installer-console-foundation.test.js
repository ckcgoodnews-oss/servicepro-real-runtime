const fs = require('fs');

const requiredFiles = [
  'src/db/postgres/036_installer_console.sql',
  'src/modules/licensing/defaultPlans.json',
  'src/modules/feature-flags/featureCatalog.js',
  'src/modules/tenant-provisioning/provisioningSteps.js',
  'src/modules/remote-diagnostics/accessScopes.js'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 36 file: ${file}`);
    process.exit(1);
  }
}

console.log('Sprint 36 installer console foundation test passed.');
