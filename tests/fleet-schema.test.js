const fs = require('fs');

const requiredFiles = [
  'src/db/postgres/031_gis_fleet.sql',
  'src/modules/mapping/providers.js',
  'src/modules/route-optimization/routeStrategies.js',
  'src/modules/geofencing/geofenceTypes.js'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 31 file: ${file}`);
    process.exit(1);
  }
}

console.log('Sprint 31 fleet/GIS package test passed.');
