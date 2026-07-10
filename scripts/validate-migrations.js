const fs = require('fs');
const path = require('path');

const dir = path.resolve('src/db/postgres');
if (!fs.existsSync(dir)) {
  console.error('Migration directory missing.');
  process.exit(1);
}

const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql'));
if (!files.length) {
  console.error('No SQL migrations found.');
  process.exit(1);
}

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  if (!content.toLowerCase().includes('create table')) {
    console.error(`Migration ${file} does not contain CREATE TABLE.`);
    process.exit(1);
  }
}

console.log(`Migration validation passed for ${files.length} file(s).`);
