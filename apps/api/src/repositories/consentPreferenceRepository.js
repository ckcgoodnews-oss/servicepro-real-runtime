const { makeId, now } = require('../services/id');
const svc = require('../services/consentPreferenceService');

function createConsentPreferenceRepository(store) {
  if (store.type === 'json') return createJsonConsentPreferenceRepository(store);
  if (store.type === 'postgres') return createPostgresConsentPreferenceRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureConsent(data) {
  data.consentPurposes ||= [];
  data.consentSubjects ||= [];
  data.consentRecords ||= [];
  data.consentPreferences ||= [];
  data.consentWithdrawals ||= [];
  data.consentAuditEvents ||= [];
  return data;
}

function addAudit(data, input) {
  const row = { id: makeId('consaudit'), ...svc.normalizeAuditEventInput(input), createdAt: now(), updatedAt: now() };
  data.consentAuditEvents.push(row);
  return row;
}

function createJsonConsentPreferenceRepository(store) {
  return {
    listPurposes(filters = {}) {
      return ensureConsent(store.read()).consentPurposes
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.purposeType || x.purposeType === filters.purposeType)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    createPurpose(input) {
      const data = ensureConsent(store.read());
      const row = { id: makeId('purpose'), ...svc.normalizePurposeInput(input), createdAt: now(), updatedAt: now() };
      data.consentPurposes.push(row);
      addAudit(data, { tenantId: row.tenantId, purposeId: row.id, eventType: 'purpose_created', message: 'Consent purpose created.' });
      store.write(data);
      return row;
    },
    listSubjects(filters = {}) {
      return ensureConsent(store.read()).consentSubjects
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.email || x.email === String(filters.email).toLowerCase())
        .sort((a, b) => String(a.email).localeCompare(String(b.email)));
    },
    createSubject(input) {
      const data = ensureConsent(store.read());
      const row = { id: makeId('subject'), ...svc.normalizeSubjectInput(input), createdAt: now(), updatedAt: now() };
      data.consentSubjects.push(row);
      addAudit(data, { tenantId: row.tenantId, subjectId: row.id, eventType: 'subject_created', actor: row.email, message: 'Consent subject created.' });
      store.write(data);
      return row;
    },
    suppressSubject(id) {
      const data = ensureConsent(store.read());
      const idx = data.consentSubjects.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.consentSubjects[idx] = svc.suppressSubject(data.consentSubjects[idx]);
      store.write(data);
      return data.consentSubjects[idx];
    },
    grantConsent(input) {
      const data = ensureConsent(store.read());
      const row = { id: makeId('consent'), ...svc.normalizeConsentInput(input), createdAt: now(), updatedAt: now() };
      data.consentRecords.push(row);
      addAudit(data, { tenantId: row.tenantId, subjectId: row.subjectId, purposeId: row.purposeId, consentId: row.id, eventType: 'consent_granted', message: 'Consent granted.' });
      store.write(data);
      return row;
    },
    listConsents(filters = {}) {
      return ensureConsent(store.read()).consentRecords
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.subjectId || x.subjectId === filters.subjectId)
        .filter(x => !filters.purposeId || x.purposeId === filters.purposeId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.grantedAt).localeCompare(String(a.grantedAt)));
    },
    withdrawConsent(id, reason = '', source = 'api') {
      const data = ensureConsent(store.read());
      const idx = data.consentRecords.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.consentRecords[idx] = svc.withdrawConsent(data.consentRecords[idx], reason);
      const withdrawal = { id: makeId('withdraw'), ...svc.normalizeWithdrawalInput({ consentId: id, tenantId: data.consentRecords[idx].tenantId, subjectId: data.consentRecords[idx].subjectId, purposeId: data.consentRecords[idx].purposeId, reason, source }), createdAt: now(), updatedAt: now() };
      data.consentWithdrawals.push(withdrawal);
      addAudit(data, { tenantId: data.consentRecords[idx].tenantId, subjectId: data.consentRecords[idx].subjectId, purposeId: data.consentRecords[idx].purposeId, consentId: id, eventType: 'consent_withdrawn', message: reason || 'Consent withdrawn.' });
      store.write(data);
      return data.consentRecords[idx];
    },
    expireConsent(id) {
      const data = ensureConsent(store.read());
      const idx = data.consentRecords.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.consentRecords[idx] = svc.expireConsent(data.consentRecords[idx]);
      addAudit(data, { tenantId: data.consentRecords[idx].tenantId, subjectId: data.consentRecords[idx].subjectId, purposeId: data.consentRecords[idx].purposeId, consentId: id, eventType: 'consent_expired', message: 'Consent expired.' });
      store.write(data);
      return data.consentRecords[idx];
    },
    upsertPreference(input) {
      const data = ensureConsent(store.read());
      const normalized = svc.normalizePreferenceInput(input);
      const idx = data.consentPreferences.findIndex(x => x.subjectId === normalized.subjectId && x.preferenceKey === normalized.preferenceKey);
      if (idx === -1) {
        const row = { id: makeId('pref'), ...normalized, createdAt: now(), updatedAt: now() };
        data.consentPreferences.push(row);
        addAudit(data, { tenantId: row.tenantId, subjectId: row.subjectId, eventType: 'preference_updated', actor: row.updatedBy, message: `Preference ${row.preferenceKey} created.` });
        store.write(data);
        return row;
      }
      data.consentPreferences[idx] = { ...data.consentPreferences[idx], ...normalized, updatedAt: now() };
      addAudit(data, { tenantId: normalized.tenantId, subjectId: normalized.subjectId, eventType: 'preference_updated', actor: normalized.updatedBy, message: `Preference ${normalized.preferenceKey} updated.` });
      store.write(data);
      return data.consentPreferences[idx];
    },
    listPreferences(filters = {}) {
      return ensureConsent(store.read()).consentPreferences
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.subjectId || x.subjectId === filters.subjectId)
        .filter(x => !filters.status || x.status === filters.status);
    },
    auditTrail(filters = {}) {
      return ensureConsent(store.read()).consentAuditEvents
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.subjectId || x.subjectId === filters.subjectId)
        .filter(x => !filters.purposeId || x.purposeId === filters.purposeId)
        .sort((a, b) => String(b.occurredAt).localeCompare(String(a.occurredAt)));
    },
    metrics(tenantId) {
      const data = ensureConsent(store.read());
      return svc.consentCoverage({
        subjects: data.consentSubjects.filter(x => !tenantId || x.tenantId === tenantId),
        purposes: data.consentPurposes.filter(x => !tenantId || x.tenantId === tenantId),
        consents: data.consentRecords.filter(x => !tenantId || x.tenantId === tenantId)
      });
    }
  };
}

function createPostgresConsentPreferenceRepository() {
  return {
    async listPurposes() { return []; },
    async createPurpose(input) { return { id: 'postgres-purpose-placeholder', ...svc.normalizePurposeInput(input) }; },
    async listSubjects() { return []; },
    async createSubject(input) { return { id: 'postgres-subject-placeholder', ...svc.normalizeSubjectInput(input) }; },
    async suppressSubject() { return null; },
    async grantConsent(input) { return { id: 'postgres-consent-placeholder', ...svc.normalizeConsentInput(input) }; },
    async listConsents() { return []; },
    async withdrawConsent() { return null; },
    async expireConsent() { return null; },
    async upsertPreference(input) { return { id: 'postgres-preference-placeholder', ...svc.normalizePreferenceInput(input) }; },
    async listPreferences() { return []; },
    async auditTrail() { return []; },
    async metrics() { return svc.consentCoverage({}); }
  };
}

module.exports = { createConsentPreferenceRepository };
