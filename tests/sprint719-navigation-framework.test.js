const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const shell = read('apps/web/src/components/AppShell.tsx');
const layout = read('apps/web/src/app/dashboard/layout.tsx');
const page = read('apps/web/src/app/dashboard/page.tsx');
const css = read('apps/web/src/app/globals.css');
const session = read('apps/web/src/auth/session.ts');
const testingGuide = read('WEBSITE_TESTING.md');

assert.match(shell, /aria-label="Primary navigation"/);
assert.match(shell, /aria-label="Breadcrumb"/);
assert.match(shell, /Select workspace/);
assert.match(shell, /Search ServicePro/);
assert.match(shell, /event\.ctrlKey \|\| event\.metaKey/);
assert.match(shell, /Open profile menu/);
assert.match(shell, /ThemeToggle/);
assert.match(shell, /LogoutButton/);
assert.match(layout, /<AuthGuard><AppShell>/);
assert.doesNotMatch(page, /className="app-shell"/);
assert.match(css, /\.command-menu/);
assert.match(css, /\.nav-open \.sidebar/);
assert.match(session, /localhost:10001/);
assert.match(testingGuide, /localhost:10001\/healthz/);

console.log('Sprint 719 navigation framework test passed.');
