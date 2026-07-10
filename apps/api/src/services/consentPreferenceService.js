const { validationError } = require('../errors/domainError');

const PURPOSE_STATUSES = ['draft', 'active', 'retired'];
const PURPOSE_TYPES = ['marketing', 'analytics', 'product', 'support', 'legal', 'security', 'other'];
const SUBJECT_STATUSES = ['active', 'suppressed', 'deleted'];
const CONSENT_STATUSES = ['granted', 'withdrawn', 'expired', 'revoked'];
const CONSENT_SOURCES = ['web', 'mobile', 'import', 'api', 'support', 'admin'];
const PREFERENCE_STATUSES = ['active', 'inactive'];
const AUDIT_EVENT_TYPES = ['subject_created', 'purpose_created', 'consent_granted', 'consent_withdrawn', 'consent_expired', 'preference_updated'];

function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function assertAllowed(value, allowed, label) {
  if (!allowed.includes(value)) throw validationError(`Unsupported ${label}: ${value}`);
}

function addDays(dateText, days) {
  const base = new Date(dateText || new Date().toISOString());
  if (Number.isNaN(base.getTime())) return '';
  base.setUTCDate(base.getUTCDate() + Number(days || 0));
  return base.toISOString();
}

function normalizePurposeInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'active';
  const purposeType = input.purposeType || 'other';
  assertAllowed(status, PURPOSE_STATUSES, 'purpose status');
  assertAllowed(purposeType, PURPOSE_TYPES, 'purpose type');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    purposeType,
    status,
    legalBasis: input.legalBasis || 'consent',
    defaultRetentionDays: Number(input.defaultRetentionDays || 730),
    metadata: input.metadata || {}
  };
}

function normalizeSubjectInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.email) throw validationError('email is required');
  const status = input.status || 'active';
  assertAllowed(status, SUBJECT_STATUSES, 'subject status');
  return {
    tenantId: input.tenantId,
    externalSubjectId: input.externalSubjectId || '',
    email: String(input.email).toLowerCase(),
    name: input.name || '',
    status,
    locale: input.locale || '',
    country: input.country || '',
    createdSource: input.createdSource || 'api',
    metadata: input.metadata || {}
  };
}

function normalizeConsentInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.subjectId) throw validationError('subjectId is required');
  if (!input.purposeId) throw validationError('purposeId is required');
  const status = input.status || 'granted';
  const source = input.source || 'api';
  assertAllowed(status, CONSENT_STATUSES, 'consent status');
  assertAllowed(source, CONSENT_SOURCES, 'consent source');
  const grantedAt = input.grantedAt || new Date().toISOString();
  return {
    tenantId: input.tenantId,
    subjectId: input.subjectId,
    purposeId: input.purposeId,
    status,
    source,
    channel: input.channel || 'email',
    proofText: input.proofText || '',
    proofUrl: input.proofUrl || '',
    grantedAt,
    withdrawnAt: input.withdrawnAt || '',
    expiresAt: input.expiresAt || '',
    withdrawalReason: input.withdrawalReason || '',
    metadata: input.metadata || {}
  };
}

function normalizePreferenceInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.subjectId) throw validationError('subjectId is required');
  if (!input.preferenceKey) throw validationError('preferenceKey is required');
  const status = input.status || 'active';
  assertAllowed(status, PREFERENCE_STATUSES, 'preference status');
  return {
    tenantId: input.tenantId,
    subjectId: input.subjectId,
    preferenceKey: input.preferenceKey,
    status,
    value: input.value === undefined ? true : input.value,
    updatedBy: input.updatedBy || '',
    updatedAt: input.updatedAt || new Date().toISOString(),
    metadata: input.metadata || {}
  };
}

function normalizeWithdrawalInput(input = {}) {
  if (!input.consentId) throw validationError('consentId is required');
  return {
    consentId: input.consentId,
    tenantId: input.tenantId || '',
    subjectId: input.subjectId || '',
    purposeId: input.purposeId || '',
    reason: input.reason || '',
    source: input.source || 'api',
    withdrawnAt: input.withdrawnAt || new Date().toISOString(),
    metadata: input.metadata || {}
  };
}

function normalizeAuditEventInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.eventType) throw validationError('eventType is required');
  assertAllowed(input.eventType, AUDIT_EVENT_TYPES, 'audit event type');
  return {
    tenantId: input.tenantId,
    subjectId: input.subjectId || '',
    purposeId: input.purposeId || '',
    consentId: input.consentId || '',
    eventType: input.eventType,
    actor: input.actor || '',
    occurredAt: input.occurredAt || new Date().toISOString(),
    message: input.message || '',
    metadata: input.metadata || {}
  };
}

function grantConsent(consent, at = new Date().toISOString()) {
  return { ...consent, status: 'granted', grantedAt: consent.grantedAt || at, withdrawnAt: '', withdrawalReason: '', updatedAt: at };
}

function withdrawConsent(consent, reason = '', at = new Date().toISOString()) {
  return { ...consent, status: 'withdrawn', withdrawnAt: at, withdrawalReason: reason, updatedAt: at };
}

function expireConsent(consent, at = new Date().toISOString()) {
  return { ...consent, status: 'expired', updatedAt: at };
}

function isConsentActive(consent, asOf = new Date().toISOString()) {
  if (consent.status !== 'granted') return false;
  if (!consent.expiresAt) return true;
  return new Date(asOf).getTime() <= new Date(consent.expiresAt).getTime();
}

function updatePreference(preference, value, updatedBy = '', at = new Date().toISOString()) {
  return { ...preference, value, updatedBy, updatedAt: at, updatedAtInternal: at };
}

function suppressSubject(subject, at = new Date().toISOString()) {
  return { ...subject, status: 'suppressed', updatedAt: at };
}

function consentCoverage({ subjects = [], purposes = [], consents = [] }) {
  const activePurposes = purposes.filter(x => x.status === 'active');
  const activeConsents = consents.filter(x => isConsentActive(x));
  return {
    activeSubjects: subjects.filter(x => x.status === 'active').length,
    activePurposes: activePurposes.length,
    activeConsents: activeConsents.length,
    withdrawnConsents: consents.filter(x => x.status === 'withdrawn').length,
    coverageRate: activePurposes.length && subjects.length ? Math.round((activeConsents.length / (activePurposes.length * subjects.length)) * 100) : 0
  };
}

module.exports = {
  PURPOSE_STATUSES,
  PURPOSE_TYPES,
  SUBJECT_STATUSES,
  CONSENT_STATUSES,
  CONSENT_SOURCES,
  PREFERENCE_STATUSES,
  AUDIT_EVENT_TYPES,
  slugCode,
  addDays,
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
};
