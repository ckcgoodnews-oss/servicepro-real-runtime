const fs = require('fs');

const required = [
  'apps/api/src/services/consentPreferenceService.js',
  'apps/api/src/repositories/consentPreferenceRepository.js',
  'apps/api/src/routes/consentPreferences.js',
  'scripts/seed-consent-preferences.js',
  'packages/database/postgres/130_consent_preferences.sql',
  'docs/sprint130-consent-preferences.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 130 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizePurposeInput,
  normalizeSubjectInput,
  normalizeConsentInput,
  normalizePreferenceInput,
  normalizeWithdrawalInput,
  normalizeAuditEventInput,
  grantConsent,
  withdrawConsent,
  expireConsent,
  isConsentActive,
  updatePreference,
  suppressSubject,
  consentCoverage
} = require('../apps/api/src/services/consentPreferenceService');

const purpose = { id: 'purpose1', ...normalizePurposeInput({ tenantId: 'tenant_demo', name: 'Marketing Email', purposeType: 'marketing' }) };
if (purpose.code !== 'MARKETING-EMAIL') process.exit(1);

let subject = { id: 'subject1', ...normalizeSubjectInput({ tenantId: 'tenant_demo', email: 'USER@EXAMPLE.COM' }) };
if (subject.email !== 'user@example.com') process.exit(1);

let consent = normalizeConsentInput({ tenantId: 'tenant_demo', subjectId: subject.id, purposeId: purpose.id, expiresAt: '2028-01-01T00:00:00.000Z' });
consent = grantConsent(consent);
if (!isConsentActive(consent, '2026-07-07T00:00:00.000Z')) process.exit(1);
consent = withdrawConsent(consent, 'unsubscribe');
if (consent.status !== 'withdrawn') process.exit(1);
consent = expireConsent({ ...consent, status: 'granted' });
if (consent.status !== 'expired') process.exit(1);

let pref = normalizePreferenceInput({ tenantId: 'tenant_demo', subjectId: subject.id, preferenceKey: 'email.news', value: true });
pref = updatePreference(pref, false, 'subject');
if (pref.value !== false) process.exit(1);

subject = suppressSubject(subject);
if (subject.status !== 'suppressed') process.exit(1);

const withdrawal = normalizeWithdrawalInput({ consentId: 'consent1' });
if (withdrawal.source !== 'api') process.exit(1);

const audit = normalizeAuditEventInput({ tenantId: 'tenant_demo', eventType: 'consent_granted' });
if (audit.eventType !== 'consent_granted') process.exit(1);

const coverage = consentCoverage({ subjects: [{ ...subject, status: 'active' }], purposes: [purpose], consents: [{ ...consent, status: 'granted', expiresAt: '2028-01-01T00:00:00.000Z' }] });
if (coverage.activeSubjects !== 1 || coverage.activePurposes !== 1 || coverage.activeConsents !== 1) process.exit(1);

console.log('Sprint 130 consent preferences patch test passed.');
