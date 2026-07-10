const fs = require('fs');

const required = [
  'apps/api/src/services/brandingService.js',
  'apps/api/src/repositories/brandingRepository.js',
  'apps/api/src/routes/branding.js',
  'scripts/seed-branding.js',
  'packages/database/postgres/099_white_label_branding_runtime.sql',
  'docs/sprint99-white-label-branding-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 99 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  slugify,
  isHexColor,
  normalizeBrandProfileInput,
  normalizeBrandAssetInput,
  normalizeTenantDomainInput,
  resolveBranding,
  generateCssVariables,
  verifyDomain
} = require('../apps/api/src/services/brandingService');

if (slugify('My Great Brand!') !== 'my-great-brand') {
  console.error('Slugify failed.');
  process.exit(1);
}

if (!isHexColor('#2563eb') || isHexColor('blue')) {
  console.error('Hex color validation failed.');
  process.exit(1);
}

const brand = { id: 'brand1', ...normalizeBrandProfileInput({ name: 'Demo Brand', theme: { primaryColor: '#111111' } }) };
if (brand.status !== 'active' || brand.theme.primaryColor !== '#111111') {
  console.error('Brand normalization failed.');
  process.exit(1);
}

const asset = normalizeBrandAssetInput({ brandId: 'brand1', assetType: 'logo', url: 'https://example.com/logo.svg' });
if (asset.assetType !== 'logo' || asset.active !== true) {
  console.error('Brand asset normalization failed.');
  process.exit(1);
}

const domain = normalizeTenantDomainInput({
  brandId: 'brand1',
  hostname: 'App.Example.COM',
  verificationToken: 'abc123'
});
if (domain.hostname !== 'app.example.com') {
  console.error('Domain normalization failed.');
  process.exit(1);
}

const verified = verifyDomain(domain, 'abc123', '2026-07-06T00:00:00.000Z');
if (verified.status !== 'verified') {
  console.error('Domain verification failed.');
  process.exit(1);
}

const resolved = resolveBranding({
  brand,
  assets: [{ ...asset, id: 'asset1' }],
  domains: [{ ...verified, id: 'domain1', isPrimary: true }]
});
if (!resolved.assets.logo || resolved.primaryDomain.hostname !== 'app.example.com') {
  console.error('Brand resolution failed.');
  process.exit(1);
}

const css = generateCssVariables(brand.theme);
if (!css.includes('--sp-primary-color')) {
  console.error('CSS variable generation failed.');
  process.exit(1);
}

console.log('Sprint 99 white-label branding runtime patch test passed.');
