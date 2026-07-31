const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const component = fs.readFileSync(
  path.join(root, 'apps/web/src/components/PublicStorefront.tsx'),
  'utf8',
);
const styles = fs.readFileSync(
  path.join(root, 'apps/web/src/app/storefront-builder.css'),
  'utf8',
);

for (const contract of [
  'storefront-utility',
  'storefront-brand-row',
  'storefront-main-nav',
  'storefront-hero-actions',
  'storefront-trust-strip',
  'storefront-reputation',
  'Schedule your service today',
]) {
  assert.match(component, new RegExp(contract));
}

for (const contract of [
  '--site-navy',
  '--site-blue',
  '.storefront-utility',
  '.storefront-trust-strip',
  '.storefront-reputation',
  '@media (max-width: 900px)',
  '@media (max-width: 620px)',
]) {
  assert.ok(styles.includes(contract), `Missing design contract: ${contract}`);
}

console.log('Sprint 777 public storefront reference design tests passed.');
