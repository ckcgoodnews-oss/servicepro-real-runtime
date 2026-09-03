const assert = require('assert');
const { auditPackageScripts, localTargets } = require('../scripts/check-package-scripts');

assert.deepStrictEqual(localTargets('node scripts/example.js && powershell -File scripts/example.ps1'), [
  'scripts/example.js',
  'scripts/example.ps1'
]);

const result = auditPackageScripts();
assert.deepStrictEqual(result.missing, []);
// Historical seed commands are intentionally removed with their archived
// implementation files. Keep a meaningful floor for operational commands
// without requiring deleted planning-era scripts to remain in package.json.
assert.ok(result.scripts > 150);

console.log(`Package script integrity test passed for ${result.scripts} commands.`);
