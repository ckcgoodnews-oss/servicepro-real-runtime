const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const component = fs.readFileSync(
  path.join(root, 'apps/web/src/components/StorefrontBuilder.tsx'),
  'utf8',
);
const library = fs.readFileSync(
  path.join(root, 'apps/web/src/data/serviceImageLibrary.ts'),
  'utf8',
);
const manifest = JSON.parse(
  fs.readFileSync(
    path.join(root, 'apps/web/public/storefront/services/manifest.json'),
    'utf8',
  ),
).asset_library;

const serviceCount = Object.values(manifest.packs).reduce(
  (total, pack) => total + Object.keys(pack.services).length,
  0,
);
const libraryCount = (library.match(/packCode: 'pack-/g) || []).length;

assert.equal(Object.keys(manifest.packs).length, 30);
assert.equal(libraryCount, serviceCount);
assert.match(component, /SERVICE_IMAGE_OPTIONS as SERVICE_IMAGE_LIBRARY/);
assert.match(component, /option\.packCode === packCode/);
assert.match(component, /SERVICE_IMAGE_GROUPS\.map/);
assert.match(component, /Suggested services/);

console.log('Sprint 777 storefront service image hierarchy tests passed.');
