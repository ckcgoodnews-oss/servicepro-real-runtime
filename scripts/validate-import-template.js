const fs = require('fs');
const path = require('path');

const templates = [
  'src/modules/csv-mapping/customerImportTemplate.csv',
  'src/modules/csv-mapping/jobImportTemplate.csv',
  'src/modules/csv-mapping/serviceImportTemplate.csv'
];

for (const template of templates) {
  const fullPath = path.resolve(template);
  if (!fs.existsSync(fullPath)) {
    console.error(`Missing template: ${template}`);
    process.exit(1);
  }

  const content = fs.readFileSync(fullPath, 'utf8').trim();
  const lines = content.split(/\r?\n/);
  if (lines.length < 2) {
    console.error(`Template has no sample row: ${template}`);
    process.exit(1);
  }
}

console.log('Import templates validated.');
