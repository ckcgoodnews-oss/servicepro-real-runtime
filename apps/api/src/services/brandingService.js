const { validationError } = require('../errors/domainError');

const BRAND_STATUSES = ['draft', 'active', 'archived'];
const DOMAIN_STATUSES = ['pending', 'verified', 'failed', 'disabled'];
const ASSET_TYPES = ['logo', 'favicon', 'app_icon', 'login_background', 'email_header', 'pdf_header', 'pdf_footer'];
const DEFAULT_THEME = {
  primaryColor: '#0f172a',
  secondaryColor: '#2563eb',
  accentColor: '#22c55e',
  backgroundColor: '#ffffff',
  surfaceColor: '#f8fafc',
  textColor: '#111827',
  mutedTextColor: '#6b7280',
  dangerColor: '#dc2626',
  warningColor: '#d97706',
  successColor: '#16a34a',
  fontFamily: 'Inter, Arial, sans-serif',
  borderRadius: '8px'
};

function slugify(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function isHexColor(value) {
  return /^#[0-9a-fA-F]{6}$/.test(String(value || ''));
}

function normalizeThemeTokens(input = {}) {
  const theme = { ...DEFAULT_THEME, ...(input || {}) };
  for (const key of Object.keys(theme)) {
    if (key.toLowerCase().includes('color') && !isHexColor(theme[key])) {
      throw validationError(`Invalid hex color for ${key}`);
    }
  }
  return theme;
}

function normalizeBrandProfileInput(input = {}) {
  if (!input.name) throw validationError('name is required');

  const status = input.status || 'active';
  if (!BRAND_STATUSES.includes(status)) throw validationError(`Unsupported brand status: ${status}`);

  return {
    code: input.code || slugify(input.name).toUpperCase().replace(/-/g, '_'),
    name: input.name,
    legalName: input.legalName || input.name,
    status,
    supportEmail: input.supportEmail || '',
    supportPhone: input.supportPhone || '',
    websiteUrl: input.websiteUrl || '',
    defaultLocale: input.defaultLocale || 'en-US',
    timezone: input.timezone || 'America/Indiana/Indianapolis',
    theme: normalizeThemeTokens(input.theme || {}),
    metadata: input.metadata || {}
  };
}

function normalizeBrandAssetInput(input = {}) {
  if (!input.brandId) throw validationError('brandId is required');
  if (!input.assetType) throw validationError('assetType is required');
  if (!ASSET_TYPES.includes(input.assetType)) throw validationError(`Unsupported asset type: ${input.assetType}`);
  if (!input.url) throw validationError('url is required');

  return {
    brandId: input.brandId,
    assetType: input.assetType,
    url: input.url,
    altText: input.altText || '',
    mediaAttachmentId: input.mediaAttachmentId || '',
    active: input.active !== false,
    metadata: input.metadata || {}
  };
}

function normalizeTenantDomainInput(input = {}) {
  if (!input.brandId) throw validationError('brandId is required');
  if (!input.hostname) throw validationError('hostname is required');

  const status = input.status || 'pending';
  if (!DOMAIN_STATUSES.includes(status)) throw validationError(`Unsupported domain status: ${status}`);

  return {
    brandId: input.brandId,
    hostname: String(input.hostname).trim().toLowerCase(),
    status,
    isPrimary: input.isPrimary === true,
    verificationToken: input.verificationToken || '',
    verifiedAt: input.verifiedAt || '',
    sslStatus: input.sslStatus || 'pending',
    metadata: input.metadata || {}
  };
}

function resolveBranding({ brand, assets = [], domains = [] }) {
  if (!brand) throw validationError('brand is required');
  const activeAssets = (assets || []).filter(asset => asset.active !== false);
  const assetMap = {};
  for (const asset of activeAssets) {
    if (!assetMap[asset.assetType]) assetMap[asset.assetType] = asset;
  }
  const primaryDomain = (domains || []).find(domain => domain.isPrimary && domain.status === 'verified') ||
    (domains || []).find(domain => domain.status === 'verified') || null;

  return {
    brandId: brand.id || '',
    code: brand.code,
    name: brand.name,
    legalName: brand.legalName,
    supportEmail: brand.supportEmail,
    supportPhone: brand.supportPhone,
    websiteUrl: brand.websiteUrl,
    defaultLocale: brand.defaultLocale,
    timezone: brand.timezone,
    theme: normalizeThemeTokens(brand.theme || {}),
    assets: assetMap,
    primaryDomain,
    resolvedAt: new Date().toISOString()
  };
}

function generateCssVariables(theme = {}) {
  const tokens = normalizeThemeTokens(theme);
  const lines = [':root {'];
  for (const [key, value] of Object.entries(tokens)) {
    const cssName = '--sp-' + key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
    lines.push(`  ${cssName}: ${value};`);
  }
  lines.push('}');
  return lines.join('\n');
}

function verifyDomain(domain, expectedToken, verifiedAt = new Date().toISOString()) {
  if (!domain) throw validationError('domain is required');
  if (!expectedToken) throw validationError('expectedToken is required');
  if (domain.verificationToken !== expectedToken) {
    return { ...domain, status: 'failed', verifiedAt: '', sslStatus: domain.sslStatus || 'pending' };
  }
  return { ...domain, status: 'verified', verifiedAt, sslStatus: domain.sslStatus || 'pending' };
}

module.exports = {
  BRAND_STATUSES,
  DOMAIN_STATUSES,
  ASSET_TYPES,
  DEFAULT_THEME,
  slugify,
  isHexColor,
  normalizeThemeTokens,
  normalizeBrandProfileInput,
  normalizeBrandAssetInput,
  normalizeTenantDomainInput,
  resolveBranding,
  generateCssVariables,
  verifyDomain
};
