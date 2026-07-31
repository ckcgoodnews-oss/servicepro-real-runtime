const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const builder = fs.readFileSync(path.join(root, 'apps/web/src/components/StorefrontBuilder.tsx'), 'utf8');
const storefront = fs.readFileSync(path.join(root, 'apps/web/src/components/PublicStorefront.tsx'), 'utf8');
const route = fs.readFileSync(path.join(root, 'apps/api/src/routes/publicStorefront.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'apps/web/src/app/storefront-builder.css'), 'utf8');

for (const token of ['publicPrimaryColor', 'publicAccentColor', 'publicDarkColor']) {
  if (!builder.includes(token) || !route.includes(token)) throw new Error(`Missing persisted color setting: ${token}`);
}

for (const input of ['name="primaryColor"', 'name="accentColor"', 'name="darkColor"']) {
  if (!builder.includes(input)) throw new Error(`Missing builder color input: ${input}`);
}

if (!builder.includes('STOREFRONT_COLOR_SCHEMES')) throw new Error('Missing storefront color presets');
if (!storefront.includes("'--site-blue': data.theme.config.primary")) throw new Error('Primary color is not applied publicly');
if (!storefront.includes("'--site-sky': data.theme.config.accent")) throw new Error('Accent color is not applied publicly');
if (!storefront.includes("'--site-navy': data.theme.config.dark")) throw new Error('Dark color is not applied publicly');
if (!css.includes('.storefront-color-presets')) throw new Error('Missing color scheme control styling');

console.log('Storefront color scheme controls and public rendering contracts verified.');
