const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../apps/web/src/components/DocumentationWorkspace.tsx'), 'utf8');

for (const title of ['Platform Administrator Guide', 'Web Developer & Technical Integration Guide', 'Business Owner Guide', 'Staff & Field Technician Guide']) {
  assert.match(source, new RegExp(title.replace(/[&]/g, '&')));
}
for (const required of ['Render deployment', 'Cloudflare configuration', 'Supabase database, pooling, RLS, and storage', 'ownerAccessGuard', 'PLATFORM_ADMIN_EMAILS', 'Public Storefront', 'Daily operating workflow']) {
  assert.match(source, new RegExp(required));
}
assert.match(source, /permitted\.has\(manual\.audience\)/);
assert.match(source, /platformAdmin.*owner.*staff/);
console.log('Role-based documentation suite test passed.');
