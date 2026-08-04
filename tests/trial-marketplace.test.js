/**
 * Trial Marketplace Service — Unit Tests
 * Covers: validation, generation, edits, expiration, authorization
 */

const {
  validateSelections,
  generateSiteContent,
  generatePublicSlug,
  applyEdits,
  regeneratePreservingEdits,
  isSiteServable,
  trialStatusFromRecord,
  isWithinRetentionPeriod,
  expiredSiteResponse,
  isRouteBlockedForTrial,
  isTrialActionAllowed,
  getEligibleOfferings,
  ALLOWED_EDIT_FIELDS,
  PROTECTED_FIELDS,
  MAX_TRIAL_SELECTIONS,
  TRIAL_DATA_RETENTION_DAYS
} = require('../apps/api/src/services/trialMarketplaceService');

function activeTrial() {
  return {
    id: 'trial-1',
    tenantId: 'trial_test_tenant',
    status: 'active',
    emailVerifiedAt: new Date().toISOString(),
    provisionedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString()
  };
}

function expiredTrial() {
  return {
    id: 'trial-2',
    tenantId: 'trial_expired_tenant',
    status: 'expired',
    emailVerifiedAt: new Date().toISOString(),
    provisionedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() - 1 * 86_400_000).toISOString()
  };
}

// ===== validateSelections =====

console.log('--- validateSelections ---');

// Valid: 1 selection
const eligible = getEligibleOfferings();
const oneSelection = validateSelections([eligible[0].id], activeTrial());
if (!oneSelection.valid) { console.error('FAIL: 1 valid selection rejected'); process.exit(1); }
if (oneSelection.offerings.length !== 1) { console.error('FAIL: 1 offering not returned'); process.exit(1); }
console.log('PASS: 1 valid selection accepted');

// Valid: 3 selections
const threeSelection = validateSelections([eligible[0].id, eligible[1].id, eligible[2].id], activeTrial());
if (!threeSelection.valid) { console.error('FAIL: 3 valid selections rejected'); process.exit(1); }
if (threeSelection.offerings.length !== 3) { console.error('FAIL: 3 offerings not returned'); process.exit(1); }
console.log('PASS: 3 valid selections accepted');

// Invalid: 0 selections
const zeroSelection = validateSelections([], activeTrial());
if (zeroSelection.valid) { console.error('FAIL: 0 selections accepted'); process.exit(1); }
console.log('PASS: 0 selections rejected');

// Invalid: 4 selections
const fourSelection = validateSelections([eligible[0].id, eligible[1].id, eligible[2].id, eligible[3].id], activeTrial());
if (fourSelection.valid) { console.error('FAIL: 4 selections accepted'); process.exit(1); }
console.log('PASS: 4 selections rejected');

// Invalid: duplicate IDs
const dupSelection = validateSelections([eligible[0].id, eligible[0].id], activeTrial());
if (dupSelection.valid) { console.error('FAIL: duplicate selections accepted'); process.exit(1); }
console.log('PASS: duplicate selections rejected');

// Invalid: non-existent ID
const badIdSelection = validateSelections(['fake_offering_id_999'], activeTrial());
if (badIdSelection.valid) { console.error('FAIL: fake ID accepted'); process.exit(1); }
console.log('PASS: ineligible offering ID rejected');

// Invalid: no trial
const noTrialSelection = validateSelections([eligible[0].id], null);
if (noTrialSelection.valid) { console.error('FAIL: null trial accepted'); process.exit(1); }
console.log('PASS: null trial rejected');

// Invalid: expired trial
const expiredTrialSelection = validateSelections([eligible[0].id], { status: 'expired' });
if (expiredTrialSelection.valid) { console.error('FAIL: expired trial accepted'); process.exit(1); }
console.log('PASS: expired trial rejected');

// ===== generateSiteContent =====

console.log('\n--- generateSiteContent ---');

const offerings = [eligible[0], eligible[1]];
const tenantData = { companyName: 'Test Plumbing Co', contactEmail: 'info@test.com', contactPhone: '555-1234' };
const site = generateSiteContent(offerings, tenantData);

if (!site.slug) { console.error('FAIL: no slug'); process.exit(1); }
if (!site.companyName) { console.error('FAIL: no companyName'); process.exit(1); }
if (!site.services || site.services.length === 0) { console.error('FAIL: no services'); process.exit(1); }
if (!site.navigation || site.navigation.length < 2) { console.error('FAIL: no navigation'); process.exit(1); }
if (!site.fieldStates) { console.error('FAIL: no fieldStates'); process.exit(1); }
if (site.trialBadge !== true) { console.error('FAIL: trialBadge not set'); process.exit(1); }
console.log(`PASS: generated site with ${site.services.length} services, slug="${site.slug}"`);

// ===== generatePublicSlug =====

console.log('\n--- generatePublicSlug ---');

if (generatePublicSlug('Acme Plumbing LLC') !== 'acme-plumbing-llc') { console.error('FAIL: slug mismatch'); process.exit(1); }
if (generatePublicSlug('') !== 'my-business') { console.error('FAIL: empty slug'); process.exit(1); }
if (generatePublicSlug('!!!') !== 'my-business') { console.error('FAIL: special chars slug'); process.exit(1); }
if (generatePublicSlug('A'.repeat(100)).length > 40) { console.error('FAIL: slug too long'); process.exit(1); }
console.log('PASS: slug generation correct');

// ===== applyEdits =====

console.log('\n--- applyEdits ---');

const baseSite = { companyName: 'Test', tagline: 'Hello', fieldStates: { companyName: 'generated', tagline: 'generated' } };

// Allowed edit
const edit1 = applyEdits({ ...baseSite, fieldStates: { ...baseSite.fieldStates } }, { companyName: 'New Name' });
if (!edit1.applied.includes('companyName')) { console.error('FAIL: allowed edit rejected'); process.exit(1); }
if (edit1.content.companyName !== 'New Name') { console.error('FAIL: edit not applied'); process.exit(1); }
if (edit1.content.fieldStates.companyName !== 'user-edited') { console.error('FAIL: fieldState not updated'); process.exit(1); }
console.log('PASS: allowed edit applied');

// Protected field rejected
const edit2 = applyEdits({ ...baseSite, fieldStates: { ...baseSite.fieldStates } }, { tenantId: 'hacked', publicSlug: 'evil' });
if (edit2.applied.length !== 0) { console.error('FAIL: protected fields accepted'); process.exit(1); }
if (edit2.rejected.length !== 2) { console.error('FAIL: protected fields not rejected'); process.exit(1); }
console.log('PASS: protected fields rejected');

// Value too long
const edit3 = applyEdits({ ...baseSite, fieldStates: { ...baseSite.fieldStates } }, { tagline: 'x'.repeat(501) });
if (edit3.applied.length !== 0) { console.error('FAIL: oversized value accepted'); process.exit(1); }
console.log('PASS: oversized value rejected');

// ===== regeneratePreservingEdits =====

console.log('\n--- regeneratePreservingEdits ---');

const currentWithEdits = { companyName: 'User Custom Name', tagline: 'Generated Tag', fieldStates: { companyName: 'user-edited', tagline: 'generated' } };
const newGenerated = { companyName: 'Auto Name', tagline: 'New Auto Tag', fieldStates: { companyName: 'generated', tagline: 'generated' } };
const preserved = regeneratePreservingEdits(currentWithEdits, newGenerated);
if (preserved.companyName !== 'User Custom Name') { console.error('FAIL: user edit not preserved'); process.exit(1); }
if (preserved.tagline !== 'New Auto Tag') { console.error('FAIL: generated field not updated'); process.exit(1); }
console.log('PASS: user edits preserved, generated fields updated');

// ===== isSiteServable =====

console.log('\n--- isSiteServable ---');

const activeCheck = isSiteServable(activeTrial());
if (!activeCheck.servable) { console.error('FAIL: active trial not servable'); process.exit(1); }
console.log('PASS: active trial is servable');

const expiredCheck = isSiteServable(expiredTrial());
if (expiredCheck.servable) { console.error('FAIL: expired trial is servable'); process.exit(1); }
if (expiredCheck.reason !== 'expired') { console.error('FAIL: wrong reason for expired'); process.exit(1); }
console.log('PASS: expired trial not servable (reason: expired)');

const convertedCheck = isSiteServable({ ...activeTrial(), convertedAt: new Date().toISOString() });
if (!convertedCheck.servable) { console.error('FAIL: converted trial not servable'); process.exit(1); }
console.log('PASS: converted trial is servable');

const nullCheck = isSiteServable(null);
if (nullCheck.servable) { console.error('FAIL: null trial is servable'); process.exit(1); }
console.log('PASS: null trial not servable');

// ===== trialStatusFromRecord =====

console.log('\n--- trialStatusFromRecord ---');

if (trialStatusFromRecord(activeTrial()) !== 'active') { console.error('FAIL: active status'); process.exit(1); }
if (trialStatusFromRecord(expiredTrial()) !== 'expired') { console.error('FAIL: expired status'); process.exit(1); }
if (trialStatusFromRecord({ ...activeTrial(), convertedAt: 'x' }) !== 'converted') { console.error('FAIL: converted status'); process.exit(1); }
if (trialStatusFromRecord({ ...activeTrial(), cancelledAt: 'x' }) !== 'cancelled') { console.error('FAIL: cancelled status'); process.exit(1); }
if (trialStatusFromRecord({ ...activeTrial(), expiresAt: new Date(Date.now() + 2 * 86_400_000).toISOString() }) !== 'expiring') { console.error('FAIL: expiring status'); process.exit(1); }
console.log('PASS: all status derivations correct');

// ===== isWithinRetentionPeriod =====

console.log('\n--- isWithinRetentionPeriod ---');

const recentlyExpired = { expiresAt: new Date(Date.now() - 5 * 86_400_000).toISOString() };
if (!isWithinRetentionPeriod(recentlyExpired)) { console.error('FAIL: 5-day expired should be in retention'); process.exit(1); }
console.log('PASS: recently expired within retention');

const longExpired = { expiresAt: new Date(Date.now() - 35 * 86_400_000).toISOString() };
if (isWithinRetentionPeriod(longExpired)) { console.error('FAIL: 35-day expired should be past retention'); process.exit(1); }
console.log('PASS: long-expired past retention');

// ===== expiredSiteResponse =====

console.log('\n--- expiredSiteResponse ---');

const expResp = expiredSiteResponse(expiredTrial());
if (!expResp.expired) { console.error('FAIL: expired flag'); process.exit(1); }
if (!expResp.message) { console.error('FAIL: no message'); process.exit(1); }
if (expResp.ctaUrl !== '/start-free') { console.error('FAIL: wrong CTA URL'); process.exit(1); }
if (typeof expResp.retentionDaysRemaining !== 'number') { console.error('FAIL: no retention days'); process.exit(1); }
console.log('PASS: expired response shape correct');

// ===== isRouteBlockedForTrial =====

console.log('\n--- isRouteBlockedForTrial ---');

if (!isRouteBlockedForTrial('/api/v1/platform/owners')) { console.error('FAIL: platform route allowed'); process.exit(1); }
if (!isRouteBlockedForTrial('/api/v1/admin/workspaces')) { console.error('FAIL: admin route allowed'); process.exit(1); }
if (!isRouteBlockedForTrial('/api/v1/tenant/settings')) { console.error('FAIL: settings route allowed'); process.exit(1); }
if (!isRouteBlockedForTrial('/api/v1/team')) { console.error('FAIL: team route allowed'); process.exit(1); }
if (!isRouteBlockedForTrial('/api/v1/audit')) { console.error('FAIL: audit route allowed'); process.exit(1); }
if (isRouteBlockedForTrial('/api/v1/trial/status')) { console.error('FAIL: trial route blocked'); process.exit(1); }
if (isRouteBlockedForTrial('/api/v1/customers')) { console.error('FAIL: customers route blocked'); process.exit(1); }
if (isRouteBlockedForTrial('/api/v1/jobs')) { console.error('FAIL: jobs route blocked'); process.exit(1); }
if (isRouteBlockedForTrial('/api/v1/trial/marketplace/offerings')) { console.error('FAIL: marketplace route blocked'); process.exit(1); }
console.log('PASS: route blocking matrix correct');

// ===== isTrialActionAllowed =====

console.log('\n--- isTrialActionAllowed ---');

if (!isTrialActionAllowed('view_workspace')) { console.error('FAIL: view_workspace denied'); process.exit(1); }
if (!isTrialActionAllowed('edit_site_fields')) { console.error('FAIL: edit_site_fields denied'); process.exit(1); }
if (!isTrialActionAllowed('view_leads')) { console.error('FAIL: view_leads denied'); process.exit(1); }
if (isTrialActionAllowed('manage_users')) { console.error('FAIL: manage_users allowed'); process.exit(1); }
if (isTrialActionAllowed('delete_tenant')) { console.error('FAIL: delete_tenant allowed'); process.exit(1); }
console.log('PASS: action allowlist correct');

// ===== getEligibleOfferings =====

console.log('\n--- getEligibleOfferings ---');

const allEligible = getEligibleOfferings();
if (allEligible.length === 0) { console.error('FAIL: no eligible offerings'); process.exit(1); }
const nonPacks = allEligible.filter(o => o.itemType !== 'service_pack');
if (nonPacks.length > 0) { console.error('FAIL: non-service_pack in eligible list'); process.exit(1); }
console.log(`PASS: ${allEligible.length} eligible offerings (all service_pack)`);

// ===== SUMMARY =====
console.log('\n=== ALL TRIAL MARKETPLACE TESTS PASSED ===');
