const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const directory = path.resolve('tests');
const tests = fs.readdirSync(directory).filter(name => name.endsWith('.test.js')).sort();
let failed = 0;

for (const test of tests) {
  const result = spawnSync(process.execPath, [path.join(directory, test)], { stdio: 'inherit' });
  if (result.status !== 0) failed += 1;
}

if (failed) {
  console.error(`${failed} of ${tests.length} test files failed.`);
  process.exit(1);
}

console.log(`All ${tests.length} test files passed.`);
