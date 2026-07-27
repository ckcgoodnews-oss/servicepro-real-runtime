const assert = require('assert');
const { auditPackageScripts, localTargets } = require('../scripts/check-package-scripts');

assert.deepStrictEqual(localTargets('node scripts/example.js && powershell -File scripts/example.ps1'), [
  'scripts/example.js',
  'scripts/example.ps1'
]);

const result = auditPackageScripts();
assert.deepStrictEqual(result.missing, []);
assert.ok(result.scripts > 600);

console.log(`Package script integrity test passed for ${result.scripts} commands.`);
