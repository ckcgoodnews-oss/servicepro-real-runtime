const fs = require('fs');

const required = [
  'apps/api/src/services/priceBookService.js',
  'apps/api/src/repositories/priceBookRepository.js',
  'apps/api/src/routes/priceBook.js',
  'scripts/seed-pricebook.js',
  'packages/database/postgres/078_pricebook_runtime.sql',
  'docs/sprint78-pricebook-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 78 patch file: ${file}`);
    process.exit(1);
  }
}

const { normalizeCategoryInput, normalizeItemInput, calculateGrossMargin, priceBookLineFromItem } = require('../apps/api/src/services/priceBookService');

const category = normalizeCategoryInput({ name: 'Drain Services' });
if (category.code !== 'DRAIN-SERVICES') {
  console.error('Category normalization failed.');
  process.exit(1);
}

const item = normalizeItemInput({
  categoryCode: 'DRAIN',
  code: 'DRAIN-CLEAN-BASIC',
  name: 'Basic drain cleaning',
  basePrice: 225,
  unitCost: 85
});

if (calculateGrossMargin(item) !== 62.22) {
  console.error('Gross margin calculation failed.');
  process.exit(1);
}

const line = priceBookLineFromItem(item, 2);
if (line.lineSubtotal !== 450 || line.lineCost !== 170) {
  console.error('Price book line conversion failed.');
  process.exit(1);
}

console.log('Sprint 78 price book runtime patch test passed.');
