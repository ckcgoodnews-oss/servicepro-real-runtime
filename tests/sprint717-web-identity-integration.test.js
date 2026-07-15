const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const required = [
  'apps/web/src/auth/session.ts',
  'apps/web/src/components/AuthGuard.tsx',
  'apps/web/src/components/IdentityForm.tsx',
  'apps/web/src/app/dashboard/layout.tsx',
  'apps/web/src/app/forgot-password/page.tsx',
  'apps/web/src/app/reset-password/page.tsx',
  'apps/web/src/app/invite/page.tsx'
];

for (const relative of required) assert.ok(fs.existsSync(path.join(root, relative)), `missing ${relative}`);

const login = read('apps/web/src/components/LoginForm.tsx');
assert.match(login, /\/auth\/login/);
assert.match(login, /saveSession/);
assert.match(login, /forgot-password/);

const guard = read('apps/web/src/components/AuthGuard.tsx');
assert.match(guard, /\/api\/v1\/me/);
assert.match(guard, /router\.replace\('\/login/);

const identity = read('apps/web/src/components/IdentityForm.tsx');
assert.match(identity, /password-reset\/request/);
assert.match(identity, /password-reset\/confirm/);
assert.match(identity, /invitations\/accept/);

console.log('Sprint 717 web identity integration contract passed.');
