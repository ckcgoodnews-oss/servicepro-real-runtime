const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const builder = fs.readFileSync(
  path.join(root, 'apps/web/src/components/StorefrontBuilder.tsx'),
  'utf8',
);
const storefront = fs.readFileSync(
  path.join(root, 'apps/web/src/components/PublicStorefront.tsx'),
  'utf8',
);
const route = fs.readFileSync(
  path.join(root, 'apps/api/src/routes/publicStorefront.js'),
  'utf8',
);

assert.match(builder, /startingPrice\?: string/);
assert.match(builder, /Free estimate, From \$129, or leave blank/);
assert.match(builder, /normalizeStartingPrice/);
assert.doesNotMatch(builder, /defaultValue=\{service\.basePrice \|\| 0\}/);
assert.match(route, /Number\(item\.basePrice\) > 0/);
assert.match(route, /presentation\[item\.id\]\?\.startingPrice/);
assert.match(storefront, /<strong>\{service\.startingPrice\}<\/strong>/);
assert.doesNotMatch(storefront, /Number\(service\.startingPrice\)/);

console.log('Sprint 777 storefront price label tests passed.');
