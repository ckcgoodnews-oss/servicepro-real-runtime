const { makeId, now } = require('../services/id');
const svc = require('../services/policyLifecycleService');

function createPolicyLifecycleRepository(store) {
  if (store.type === 'json') return createJsonPolicyLifecycleRepository(store);
  if (store.type === 'postgres') return createPostgresPolicyLifecycleRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensurePolicy(data) {
  data.policies ||= [];
  data.policyVersions ||= [];
  data.policyApprovals ||= [];
  data.policyAttestations ||= [];
  data.policyExceptions ||= [];
  data.policyReviews ||= [];
  return data;
}

function createJsonPolicyLifecycleRepository(store) {
  return {
    listPolicies(filters = {}) {
      return ensurePolicy(store.read()).policies
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.policyType || x.policyType === filters.policyType)
        .sort((a, b) => String(a.title).localeCompare(String(b.title)));
    },
    createPolicy(input) {
      const data = ensurePolicy(store.read());
      const row = { id: makeId('policy'), ...svc.normalizePolicyInput(input), createdAt: now(), updatedAt: now() };
      data.policies.push(row);
      store.write(data);
      return row;
    },
    createVersion(input) {
      const data = ensurePolicy(store.read());
      const row = { id: makeId('polver'), ...svc.normalizeVersionInput(input), createdAt: now(), updatedAt: now() };
      data.policyVersions.push(row);
      store.write(data);
      return row;
    },
    listVersions(policyId) {
      return ensurePolicy(store.read()).policyVersions.filter(x => x.policyId === policyId).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    },
    submitVersion(id) {
      const data = ensurePolicy(store.read());
      const idx = data.policyVersions.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.policyVersions[idx] = svc.submitVersion(data.policyVersions[idx]);
      store.write(data);
      return data.policyVersions[idx];
    },
    approveVersion(id) {
      const data = ensurePolicy(store.read());
      const idx = data.policyVersions.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.policyVersions[idx] = svc.approveVersion(data.policyVersions[idx]);
      store.write(data);
      return data.policyVersions[idx];
    },
    publishVersion(id) {
      const data = ensurePolicy(store.read());
      const idx = data.policyVersions.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.policyVersions[idx] = svc.publishVersion(data.policyVersions[idx]);
      const policyIdx = data.policies.findIndex(x => x.id === data.policyVersions[idx].policyId);
      if (policyIdx !== -1) data.policies[policyIdx] = svc.publishPolicy(data.policies[policyIdx], data.policyVersions[idx]);
      for (let i = 0; i < data.policyVersions.length; i++) {
        if (i !== idx && data.policyVersions[i].policyId === data.policyVersions[idx].policyId && data.policyVersions[i].status === 'published') {
          data.policyVersions[i] = { ...data.policyVersions[i], status: 'superseded', updatedAt: now() };
        }
      }
      store.write(data);
      return data.policyVersions[idx];
    },
    createApproval(input) {
      const data = ensurePolicy(store.read());
      const row = { id: makeId('polapp'), ...svc.normalizeApprovalInput(input), createdAt: now(), updatedAt: now() };
      data.policyApprovals.push(row);
      store.write(data);
      return row;
    },
    approveGate(id, comments = '') {
      const data = ensurePolicy(store.read());
      const idx = data.policyApprovals.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.policyApprovals[idx] = svc.approveGate(data.policyApprovals[idx], comments);
      store.write(data);
      return data.policyApprovals[idx];
    },
    rejectGate(id, comments = '') {
      const data = ensurePolicy(store.read());
      const idx = data.policyApprovals.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.policyApprovals[idx] = svc.rejectGate(data.policyApprovals[idx], comments);
      store.write(data);
      return data.policyApprovals[idx];
    },
    createAttestation(input) {
      const data = ensurePolicy(store.read());
      const row = { id: makeId('polatt'), ...svc.normalizeAttestationInput(input), createdAt: now(), updatedAt: now() };
      data.policyAttestations.push(row);
      store.write(data);
      return row;
    },
    listAttestations(filters = {}) {
      return ensurePolicy(store.read()).policyAttestations
        .filter(x => !filters.policyId || x.policyId === filters.policyId)
        .filter(x => !filters.subjectId || x.subjectId === filters.subjectId)
        .filter(x => !filters.status || x.status === filters.status);
    },
    acknowledgeAttestation(id) {
      const data = ensurePolicy(store.read());
      const idx = data.policyAttestations.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.policyAttestations[idx] = svc.acknowledgeAttestation(data.policyAttestations[idx]);
      store.write(data);
      return data.policyAttestations[idx];
    },
    markOverdueAttestations(asOf = new Date().toISOString()) {
      const data = ensurePolicy(store.read());
      data.policyAttestations = data.policyAttestations.map(x => svc.markAttestationOverdue(x, asOf));
      store.write(data);
      return data.policyAttestations.filter(x => x.status === 'overdue');
    },
    createException(input) {
      const data = ensurePolicy(store.read());
      const row = { id: makeId('polex'), ...svc.normalizeExceptionInput(input), createdAt: now(), updatedAt: now() };
      data.policyExceptions.push(row);
      store.write(data);
      return row;
    },
    approveException(id, decidedBy) {
      const data = ensurePolicy(store.read());
      const idx = data.policyExceptions.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.policyExceptions[idx] = svc.approveException(data.policyExceptions[idx], decidedBy);
      store.write(data);
      return data.policyExceptions[idx];
    },
    rejectException(id, decidedBy) {
      const data = ensurePolicy(store.read());
      const idx = data.policyExceptions.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.policyExceptions[idx] = svc.rejectException(data.policyExceptions[idx], decidedBy);
      store.write(data);
      return data.policyExceptions[idx];
    },
    createReview(input) {
      const data = ensurePolicy(store.read());
      const row = { id: makeId('polrev'), ...svc.normalizeReviewInput(input), createdAt: now(), updatedAt: now() };
      data.policyReviews.push(row);
      store.write(data);
      return row;
    },
    completeReview(id, notes = '') {
      const data = ensurePolicy(store.read());
      const idx = data.policyReviews.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.policyReviews[idx] = svc.completeReview(data.policyReviews[idx], notes);
      const policyIdx = data.policies.findIndex(x => x.id === data.policyReviews[idx].policyId);
      if (policyIdx !== -1) data.policies[policyIdx] = svc.applyReviewToPolicy(data.policies[policyIdx], data.policyReviews[idx]);
      store.write(data);
      return data.policyReviews[idx];
    },
    metrics(tenantId) {
      const data = ensurePolicy(store.read());
      return svc.policyMetrics({
        policies: data.policies.filter(x => !tenantId || x.tenantId === tenantId),
        versions: data.policyVersions.filter(x => !tenantId || x.tenantId === tenantId),
        approvals: data.policyApprovals.filter(x => !tenantId || x.tenantId === tenantId),
        attestations: data.policyAttestations.filter(x => !tenantId || x.tenantId === tenantId),
        exceptions: data.policyExceptions.filter(x => !tenantId || x.tenantId === tenantId),
        reviews: data.policyReviews.filter(x => !tenantId || x.tenantId === tenantId)
      });
    }
  };
}

function createPostgresPolicyLifecycleRepository() {
  return {
    async listPolicies() { return []; },
    async createPolicy(input) { return { id: 'postgres-policy-placeholder', ...svc.normalizePolicyInput(input) }; },
    async createVersion(input) { return { id: 'postgres-version-placeholder', ...svc.normalizeVersionInput(input) }; },
    async listVersions() { return []; },
    async submitVersion() { return null; },
    async approveVersion() { return null; },
    async publishVersion() { return null; },
    async createApproval(input) { return { id: 'postgres-approval-placeholder', ...svc.normalizeApprovalInput(input) }; },
    async approveGate() { return null; },
    async rejectGate() { return null; },
    async createAttestation(input) { return { id: 'postgres-attestation-placeholder', ...svc.normalizeAttestationInput(input) }; },
    async listAttestations() { return []; },
    async acknowledgeAttestation() { return null; },
    async markOverdueAttestations() { return []; },
    async createException(input) { return { id: 'postgres-exception-placeholder', ...svc.normalizeExceptionInput(input) }; },
    async approveException() { return null; },
    async rejectException() { return null; },
    async createReview(input) { return { id: 'postgres-review-placeholder', ...svc.normalizeReviewInput(input) }; },
    async completeReview() { return null; },
    async metrics() { return svc.policyMetrics({}); }
  };
}

module.exports = { createPolicyLifecycleRepository };
