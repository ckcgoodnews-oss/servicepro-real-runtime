const fs = require('fs');

const requiredTemplates = [
  'src/modules/csv-mapping/customerImportTemplate.csv',
  'src/modules/csv-mapping/jobImportTemplate.csv',
  'src/modules/csv-mapping/serviceImportTemplate.csv'
];

for (const file of requiredTemplates) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required import template: ${file}`);
    process.exit(1);
  }
}

console.log('Import template test passed.');
