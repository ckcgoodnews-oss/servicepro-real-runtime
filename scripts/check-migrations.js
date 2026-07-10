const fs = require('fs');
const path = require('path');

const dir = path.resolve('packages/database/postgres');

function main() {
  if (!fs.existsSync(dir)) {
    console.error(`Migration directory not found: ${dir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(dir)
    .filter(name => /^\d{3}_.+\.sql$/.test(name))
    .sort();

  if (!files.length) {
    console.error('No PostgreSQL migration files found.');
    process.exit(1);
  }

  const numbers = files.map(file => Number(file.slice(0, 3)));
  const duplicates = numbers.filter((num, idx) => numbers.indexOf(num) !== idx);

  if (duplicates.length) {
    console.error(`Duplicate migration numbers found: ${Array.from(new Set(duplicates)).join(', ')}`);
    process.exit(1);
  }

  for (let i = 1; i < numbers.length; i += 1) {
    if (numbers[i] <= numbers[i - 1]) {
      console.error(`Migration order problem around ${files[i - 1]} and ${files[i]}`);
      process.exit(1);
    }
  }

  const latest = files[files.length - 1];
  console.log(`Migration check passed. ${files.length} migration(s). Latest: ${latest}`);
}

main();
