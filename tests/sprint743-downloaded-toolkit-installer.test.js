const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const installer = fs.readFileSync(path.join(root, 'scripts', 'apply-downloaded-sprint.ps1'), 'utf8');

assert.match(installer, /Expand-Archive\s+-LiteralPath/);
assert.match(installer, /servicepro-sprint\$SprintNumber-\*\.zip/);
assert.ok(installer.includes('APPLY-SPRINT-{0}.ps1'));
assert.ok(installer.includes('VERIFY-SPRINT-{0}.ps1'));
assert.match(installer, /I:\\REPO\\servicepro-cumulative/);
assert.match(installer, /Multiple Sprint \$SprintNumber ZIPs were found/);
assert.match(installer, /ForceExtract/);
assert.doesNotMatch(installer, /Remove-Item[^\n]+RepoPath/);

console.log('Sprint 743 downloaded toolkit installer test passed.');
