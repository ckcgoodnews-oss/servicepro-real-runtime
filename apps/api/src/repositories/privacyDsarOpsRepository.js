const { makeId, now } = require('../services/id');
const svc = require('../services/privacyDsarOpsService');

function createPrivacyDsarOpsRepository(store) {
  if (store.type === 'json') return createJsonPrivacyDsarOpsRepository(store);
  if (store.type === 'postgres') return createPostgresPrivacyDsarOpsRepository();
  throw new Error(`Unsupported store type: ${store.type}`);
}
function ensurePrivacy(data) {
  data.privacyDsars ||= [];
  data.privacyConsents ||= [];
  data.privacyRetentionPolicies ||= [];
  data.privacyDeletionJobs ||= [];
  data.privacyProcessingActivities ||= [];
  data.privacyDpias ||= [];
  data.privacyBreachNotifications ||= [];
  return data;
}
function updateById(rows, id, fn) {
  const idx = rows.findIndex(x => x.id === id);
  if (idx === -1) return null;
  rows[idx] = fn(rows[idx]);
  return rows[idx];
}
function createJsonPrivacyDsarOpsRepository(store) {
  return {
    createDsar(input) { const data = ensurePrivacy(store.read()); const row = { id: makeId('dsar'), ...svc.normalizeDsarInput(input), createdAt: now(), updatedAt: now() }; row.requestNumber = row.requestNumber || `DSAR-${String(data.privacyDsars.length + 1).padStart(8, '0')}`; data.privacyDsars.push(row); store.write(data); return row; },
    verifyDsarIdentity(id) { const data = ensurePrivacy(store.read()); const row = updateById(data.privacyDsars, id, svc.verifyDsarIdentity); store.write(data); return row; },
    fulfillDsar(id, notes = '') { const data = ensurePrivacy(store.read()); const row = updateById(data.privacyDsars, id, x => svc.fulfillDsar(x, notes)); store.write(data); return row; },
    denyDsar(id, reason) { const data = ensurePrivacy(store.read()); const row = updateById(data.privacyDsars, id, x => svc.denyDsar(x, reason)); store.write(data); return row; },
    createConsent(input) { const data = ensurePrivacy(store.read()); const row = { id: makeId('consent'), ...svc.normalizeConsentInput(input), createdAt: now(), updatedAt: now() }; data.privacyConsents.push(row); store.write(data); return row; },
    withdrawConsent(id) { const data = ensurePrivacy(store.read()); const row = updateById(data.privacyConsents, id, svc.withdrawConsent); store.write(data); return row; },
    createRetentionPolicy(input) { const data = ensurePrivacy(store.read()); const row = { id: makeId('retention'), ...svc.normalizeRetentionPolicyInput(input), createdAt: now(), updatedAt: now() }; data.privacyRetentionPolicies.push(row); store.write(data); return row; },
    activateRetentionPolicy(id) { const data = ensurePrivacy(store.read()); const row = updateById(data.privacyRetentionPolicies, id, svc.activateRetentionPolicy); store.write(data); return row; },
    retireRetentionPolicy(id) { const data = ensurePrivacy(store.read()); const row = updateById(data.privacyRetentionPolicies, id, svc.retireRetentionPolicy); store.write(data); return row; },
    createDeletionJob(input) { const data = ensurePrivacy(store.read()); const row = { id: makeId('deljob'), ...svc.normalizeDeletionJobInput(input), createdAt: now(), updatedAt: now() }; data.privacyDeletionJobs.push(row); store.write(data); return row; },
    startDeletionJob(id) { const data = ensurePrivacy(store.read()); const row = updateById(data.privacyDeletionJobs, id, svc.startDeletionJob); store.write(data); return row; },
    completeDeletionJob(id, recordsDeleted = 0) { const data = ensurePrivacy(store.read()); const row = updateById(data.privacyDeletionJobs, id, x => svc.completeDeletionJob(x, recordsDeleted)); store.write(data); return row; },
    failDeletionJob(id, reason) { const data = ensurePrivacy(store.read()); const row = updateById(data.privacyDeletionJobs, id, x => svc.failDeletionJob(x, reason)); store.write(data); return row; },
    createProcessingActivity(input) { const data = ensurePrivacy(store.read()); const row = { id: makeId('ropa'), ...svc.normalizeProcessingActivityInput(input), createdAt: now(), updatedAt: now() }; data.privacyProcessingActivities.push(row); store.write(data); return row; },
    activateProcessingActivity(id) { const data = ensurePrivacy(store.read()); const row = updateById(data.privacyProcessingActivities, id, svc.activateProcessingActivity); store.write(data); return row; },
    retireProcessingActivity(id) { const data = ensurePrivacy(store.read()); const row = updateById(data.privacyProcessingActivities, id, svc.retireProcessingActivity); store.write(data); return row; },
    createDpia(input) { const data = ensurePrivacy(store.read()); const row = { id: makeId('dpia'), ...svc.normalizeDpiaInput(input), createdAt: now(), updatedAt: now() }; data.privacyDpias.push(row); store.write(data); return row; },
    submitDpiaForReview(id, assessor = '', summary = '') { const data = ensurePrivacy(store.read()); const row = updateById(data.privacyDpias, id, x => svc.submitDpiaForReview(x, assessor, summary)); store.write(data); return row; },
    approveDpia(id, reviewedBy) { const data = ensurePrivacy(store.read()); const row = updateById(data.privacyDpias, id, x => svc.approveDpia(x, reviewedBy)); store.write(data); return row; },
    rejectDpia(id, reviewedBy, reason) { const data = ensurePrivacy(store.read()); const row = updateById(data.privacyDpias, id, x => svc.rejectDpia(x, reviewedBy, reason)); store.write(data); return row; },
    createBreach(input) { const data = ensurePrivacy(store.read()); const row = { id: makeId('privbreach'), ...svc.normalizeBreachNotificationInput(input), createdAt: now(), updatedAt: now() }; data.privacyBreachNotifications.push(row); store.write(data); return row; },
    confirmBreach(id) { const data = ensurePrivacy(store.read()); const row = updateById(data.privacyBreachNotifications, id, svc.confirmBreach); store.write(data); return row; },
    reportBreach(id, regulatorReference = '') { const data = ensurePrivacy(store.read()); const row = updateById(data.privacyBreachNotifications, id, x => svc.reportBreach(x, regulatorReference)); store.write(data); return row; },
    notifySubjects(id) { const data = ensurePrivacy(store.read()); const row = updateById(data.privacyBreachNotifications, id, svc.notifySubjects); store.write(data); return row; },
    closeBreach(id) { const data = ensurePrivacy(store.read()); const row = updateById(data.privacyBreachNotifications, id, svc.closeBreach); store.write(data); return row; },
    metrics(tenantId) { const data = ensurePrivacy(store.read()); return svc.privacyMetrics({ dsars: data.privacyDsars.filter(x => !tenantId || x.tenantId === tenantId), consents: data.privacyConsents.filter(x => !tenantId || x.tenantId === tenantId), policies: data.privacyRetentionPolicies.filter(x => !tenantId || x.tenantId === tenantId), deletionJobs: data.privacyDeletionJobs.filter(x => !tenantId || x.tenantId === tenantId), activities: data.privacyProcessingActivities.filter(x => !tenantId || x.tenantId === tenantId), dpias: data.privacyDpias.filter(x => !tenantId || x.tenantId === tenantId), breaches: data.privacyBreachNotifications.filter(x => !tenantId || x.tenantId === tenantId) }); }
  };
}
function createPostgresPrivacyDsarOpsRepository() {
  return {
    async createDsar(input) { return { id: 'postgres-dsar-placeholder', ...svc.normalizeDsarInput(input) }; }, async verifyDsarIdentity() { return null; }, async fulfillDsar() { return null; }, async denyDsar() { return null; },
    async createConsent(input) { return { id: 'postgres-consent-placeholder', ...svc.normalizeConsentInput(input) }; }, async withdrawConsent() { return null; },
    async createRetentionPolicy(input) { return { id: 'postgres-retention-placeholder', ...svc.normalizeRetentionPolicyInput(input) }; }, async activateRetentionPolicy() { return null; }, async retireRetentionPolicy() { return null; },
    async createDeletionJob(input) { return { id: 'postgres-deletion-placeholder', ...svc.normalizeDeletionJobInput(input) }; }, async startDeletionJob() { return null; }, async completeDeletionJob() { return null; }, async failDeletionJob() { return null; },
    async createProcessingActivity(input) { return { id: 'postgres-activity-placeholder', ...svc.normalizeProcessingActivityInput(input) }; }, async activateProcessingActivity() { return null; }, async retireProcessingActivity() { return null; },
    async createDpia(input) { return { id: 'postgres-dpia-placeholder', ...svc.normalizeDpiaInput(input) }; }, async submitDpiaForReview() { return null; }, async approveDpia() { return null; }, async rejectDpia() { return null; },
    async createBreach(input) { return { id: 'postgres-breach-placeholder', ...svc.normalizeBreachNotificationInput(input) }; }, async confirmBreach() { return null; }, async reportBreach() { return null; }, async notifySubjects() { return null; }, async closeBreach() { return null; },
    async metrics() { return svc.privacyMetrics({}); }
  };
}
module.exports = { createPrivacyDsarOpsRepository };
