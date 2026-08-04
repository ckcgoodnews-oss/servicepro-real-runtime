/**
 * Trial Marketplace Service
 *
 * Handles trial-specific marketplace selection, site generation,
 * and restricted editing for trial tenants.
 */

const { validationError } = require('../errors/domainError');
const { defaultMarketplaceItems } = require('../data/serviceMarketplaceCatalog');

const MAX_TRIAL_SELECTIONS = 3;
const MIN_TRIAL_SELECTIONS = 1;

// Only service_pack items are eligible for trial
const TRIAL_ELIGIBLE_ITEM_TYPE = 'service_pack';

// Fields trial users are allowed to edit on their generated site
const ALLOWED_EDIT_FIELDS = new Set([
  'companyName', 'contactEmail', 'contactPhone', 'tagline',
  'description', 'serviceArea', 'hours', 'logoUrl', 'heroImageUrl',
  'primaryColor', 'secondaryColor'
]);

// Fields that are protected (cannot be changed by trial users)
const PROTECTED_FIELDS = new Set([
  'tenantId', 'publicSlug', 'publicPublished', 'publicPublishedAt',
  'publicUnpublishedAt', 'trialSiteId', 'trialStatus', 'provisioningState',
  'templateVersion', 'theme', 'publicServiceIds', 'publicServicePresentation'
]);

/**
 * Get marketplace items eligible for trial selection.
 */
function getEligibleOfferings() {
  const catalog = defaultMarketplaceItems(new Date().toISOString());
  return catalog.filter(item => item.itemType === TRIAL_ELIGIBLE_ITEM_TYPE && item.status === 'published');
}

/**
 * Validate trial marketplace selections.
 * @param {string[]} selectionIds - Array of marketplace item IDs
 * @param {object} trial - Current trial record
 * @returns {{ valid: boolean, errors: string[], offerings: object[] }}
 */
function validateSelections(selectionIds, trial) {
  const errors = [];

  if (!Array.isArray(selectionIds) || selectionIds.length === 0) {
    errors.push(`Select between ${MIN_TRIAL_SELECTIONS} and ${MAX_TRIAL_SELECTIONS} service packs.`);
    return { valid: false, errors, offerings: [] };
  }

  if (selectionIds.length < MIN_TRIAL_SELECTIONS) {
    errors.push(`Select at least ${MIN_TRIAL_SELECTIONS} service pack.`);
  }
  if (selectionIds.length > MAX_TRIAL_SELECTIONS) {
    errors.push(`Select at most ${MAX_TRIAL_SELECTIONS} service packs.`);
  }

  // Deduplicate
  const unique = [...new Set(selectionIds)];
  if (unique.length !== selectionIds.length) {
    errors.push('Duplicate selections are not allowed.');
  }

  // Validate each ID against eligible catalog
  const eligible = getEligibleOfferings();
  const eligibleIds = new Set(eligible.map(item => item.id));
  const offerings = [];

  for (const id of unique) {
    if (!eligibleIds.has(id)) {
      errors.push(`Offering "${id}" is not eligible for trial.`);
    } else {
      offerings.push(eligible.find(item => item.id === id));
    }
  }

  // Check trial state
  if (!trial) {
    errors.push('No active trial found.');
  } else if (trial.status !== 'active' && trial.status !== 'provisioning') {
    errors.push('Trial is not in an active state for marketplace selection.');
  }

  return { valid: errors.length === 0, errors, offerings };
}

/**
 * Generate a sanitized public URL slug from company name.
 * Avoids internal IDs in the URL.
 */
function generatePublicSlug(companyName) {
  const base = String(companyName || 'my-business')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return base || 'my-business';
}

/**
 * Generate site content from offerings and tenant data.
 * @param {object[]} offerings - Selected marketplace offerings
 * @param {object} tenantData - Tenant settings/branding
 * @returns {object} Generated site content structure
 */
function generateSiteContent(offerings, tenantData) {
  const companyName = tenantData.companyName || 'My Business';
  const slug = generatePublicSlug(companyName);

  // Build service pages from offerings
  const services = [];
  for (const offering of offerings) {
    for (const feature of (offering.features || [])) {
      services.push({
        id: `svc_${offering.id}_${services.length}`,
        name: feature,
        description: `Professional ${feature.toLowerCase()} from experienced local specialists.`,
        offeringId: offering.id,
        offeringName: offering.name,
        imageUrl: `/storefront/services/${offering.code}/${feature.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`,
        fieldState: 'generated'
      });
    }
  }

  // Navigation
  const navigation = [
    { label: 'Home', path: '/', type: 'home' },
    ...offerings.map(o => ({ label: o.name.replace(/ Pack$| Operations Pack$/, ''), path: `#${o.code}`, type: 'service_section' })),
    { label: 'Contact', path: '#contact', type: 'contact' }
  ];

  return {
    slug,
    companyName,
    tagline: tenantData.tagline || `Professional ${offerings[0]?.name.replace(/ Pack$| Operations Pack$/, '').toLowerCase() || 'service'} you can depend on`,
    description: tenantData.description || `Local ${offerings.map(o => o.industries?.[0] || '').filter(Boolean).join(', ')} professionals serving your community.`,
    theme: 'evergreen',
    primaryColor: offerings[0]?.accentColor || '#176b5b',
    secondaryColor: '#b9e55b',
    heroImageUrl: `/storefront/industries/${offerings[0]?.industries?.[0] || 'plumbing'}.svg`,
    services,
    navigation,
    contactEmail: tenantData.contactEmail || '',
    contactPhone: tenantData.contactPhone || '',
    serviceArea: tenantData.serviceArea || '',
    hours: tenantData.hours || '',
    logoUrl: tenantData.logoUrl || '',
    trialBadge: true,
    fieldStates: {
      companyName: 'generated',
      tagline: 'generated',
      description: 'generated',
      contactEmail: 'generated',
      contactPhone: 'generated',
      serviceArea: 'generated',
      hours: 'generated',
      logoUrl: 'generated',
      heroImageUrl: 'generated',
      primaryColor: 'generated',
      secondaryColor: 'generated'
    }
  };
}

/**
 * Apply allowed edits to site content, preserving field state tracking.
 * @param {object} currentContent - Current site content
 * @param {object} edits - Requested edits
 * @returns {{ content: object, applied: string[], rejected: string[] }}
 */
function applyEdits(currentContent, edits) {
  const applied = [];
  const rejected = [];

  for (const [key, value] of Object.entries(edits || {})) {
    if (PROTECTED_FIELDS.has(key)) {
      rejected.push(key);
      continue;
    }
    if (!ALLOWED_EDIT_FIELDS.has(key)) {
      rejected.push(key);
      continue;
    }
    // Content validation
    if (typeof value !== 'string' || value.length > 500) {
      rejected.push(key);
      continue;
    }
    // Apply
    currentContent[key] = value;
    if (currentContent.fieldStates) {
      currentContent.fieldStates[key] = 'user-edited';
    }
    applied.push(key);
  }

  return { content: currentContent, applied, rejected };
}

/**
 * Validate that a regeneration preserves user-edited fields.
 */
function regeneratePreservingEdits(currentContent, newGenerated) {
  const preserved = { ...newGenerated };
  if (currentContent.fieldStates) {
    for (const [field, state] of Object.entries(currentContent.fieldStates)) {
      if (state === 'user-edited' && currentContent[field] !== undefined) {
        preserved[field] = currentContent[field];
        preserved.fieldStates = preserved.fieldStates || {};
        preserved.fieldStates[field] = 'user-edited';
      }
    }
  }
  return preserved;
}

/**
 * Check if a trial site should be served publicly.
 * Expired trials return a branded "coming soon" page pointing to ServicePro.
 * Data is preserved for 30 days post-expiration.
 */
const TRIAL_DATA_RETENTION_DAYS = 30;

function isSiteServable(trial) {
  if (!trial) return { servable: false, reason: 'no_trial' };
  const status = trialStatusFromRecord(trial);
  if (status === 'active' || status === 'expiring') return { servable: true, reason: null };
  if (status === 'converted') return { servable: true, reason: null };
  if (status === 'expired') return { servable: false, reason: 'expired' };
  if (status === 'cancelled' || status === 'suspended') return { servable: false, reason: status };
  return { servable: false, reason: 'not_provisioned' };
}

function trialStatusFromRecord(trial) {
  if (trial.convertedAt || trial.converted_at) return 'converted';
  if (trial.cancelledAt || trial.cancelled_at) return 'cancelled';
  if (trial.suspendedAt || trial.suspended_at) return 'suspended';
  if (!trial.emailVerifiedAt && !trial.email_verified_at) return 'pending_verification';
  if (!trial.provisionedAt && !trial.provisioned_at) return 'provisioning';
  const expiresAt = trial.expiresAt || trial.expires_at;
  if (!expiresAt) return 'active';
  const remaining = Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000));
  if (remaining <= 0) return 'expired';
  if (remaining <= 3) return 'expiring';
  return 'active';
}

function isWithinRetentionPeriod(trial) {
  const expiresAt = trial.expiresAt || trial.expires_at;
  if (!expiresAt) return true;
  const expiryDate = new Date(expiresAt);
  const retentionEnd = new Date(expiryDate.getTime() + TRIAL_DATA_RETENTION_DAYS * 86_400_000);
  return Date.now() < retentionEnd.getTime();
}

/**
 * Generate the expired-trial public response (branded upgrade CTA).
 */
function expiredSiteResponse(trial) {
  return {
    expired: true,
    message: 'This business is setting up their online presence.',
    cta: 'Start your own free trial',
    ctaUrl: '/start-free',
    retentionDaysRemaining: Math.max(0, Math.ceil(
      ((new Date(trial.expiresAt || trial.expires_at).getTime() + TRIAL_DATA_RETENTION_DAYS * 86_400_000) - Date.now()) / 86_400_000
    ))
  };
}

/**
 * Check if a trial user is allowed to perform an action.
 */
function isTrialActionAllowed(action) {
  const ALLOWED_ACTIONS = new Set([
    'view_workspace', 'view_trial_status', 'view_site',
    'edit_site_fields', 'view_leads', 'request_upgrade',
    'view_onboarding', 'complete_onboarding_step',
    'select_industry', 'select_offerings', 'install_sample_data'
  ]);
  return ALLOWED_ACTIONS.has(action);
}

/**
 * List of routes/permissions denied to trial users.
 */
const TRIAL_DENIED_PATTERNS = [
  '/api/v1/platform/',
  '/api/v1/admin/',
  '/api/v1/tenant/settings',
  '/api/v1/tenant/features',
  '/api/v1/team',
  '/api/v1/authz',
  '/api/v1/organization',
  '/api/v1/security/',
  '/api/v1/integrity',
  '/api/v1/observability/',
  '/api/v1/audit',
];

function isRouteBlockedForTrial(url) {
  return TRIAL_DENIED_PATTERNS.some(pattern => url.startsWith(pattern));
}

module.exports = {
  MAX_TRIAL_SELECTIONS,
  MIN_TRIAL_SELECTIONS,
  TRIAL_ELIGIBLE_ITEM_TYPE,
  TRIAL_DATA_RETENTION_DAYS,
  ALLOWED_EDIT_FIELDS,
  PROTECTED_FIELDS,
  getEligibleOfferings,
  validateSelections,
  generatePublicSlug,
  generateSiteContent,
  applyEdits,
  regeneratePreservingEdits,
  isSiteServable,
  trialStatusFromRecord,
  isWithinRetentionPeriod,
  expiredSiteResponse,
  isTrialActionAllowed,
  isRouteBlockedForTrial,
  TRIAL_DENIED_PATTERNS
};
