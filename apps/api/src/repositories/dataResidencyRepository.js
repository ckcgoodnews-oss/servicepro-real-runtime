const { makeId, now } = require('../services/id');
const svc = require('../services/dataResidencyService');

function createDataResidencyRepository(store) {
  if (store.type === 'json') return createJsonDataResidencyRepository(store);
  if (store.type === 'postgres') return createPostgresDataResidencyRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureResidency(data) {
  data.dataResidencyPolicies ||= [];
  data.dataRegionAssignments ||= [];
  data.dataTransferReviews ||= [];
  data.dataLocalizationRequirements ||= [];
  data.dataResidencyViolations ||= [];
  data.dataTransferApprovals ||= [];
  return data;
}

function createJsonDataResidencyRepository(store) {
  return {
    listPolicies(filters = {}) {
      return ensureResidency(store.read()).dataResidencyPolicies
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    createPolicy(input) {
      const data = ensureResidency(store.read());
      const row = { id: makeId('respol'), ...svc.normalizePolicyInput(input), createdAt: now(), updatedAt: now() };
      data.dataResidencyPolicies.push(row);
      store.write(data);
      return row;
    },
    listAssignments(filters = {}) {
      return ensureResidency(store.read()).dataRegionAssignments
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.customerId || x.customerId === filters.customerId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.assignedAt).localeCompare(String(a.assignedAt)));
    },
    createAssignment(input) {
      const data = ensureResidency(store.read());
      const row = { id: makeId('resassign'), ...svc.normalizeRegionAssignmentInput(input), createdAt: now(), updatedAt: now() };
      data.dataRegionAssignments.push(row);
      store.write(data);
      return row;
    },
    createTransferReview(input) {
      const data = ensureResidency(store.read());
      const row = { id: makeId('transfer'), ...svc.normalizeTransferReviewInput(input), createdAt: now(), updatedAt: now() };
      row.requestNumber = row.requestNumber || `DR-${String(data.dataTransferReviews.length + 1).padStart(6, '0')}`;
      data.dataTransferReviews.push(row);
      store.write(data);
      return row;
    },
    listTransferReviews(filters = {}) {
      return ensureResidency(store.read()).dataTransferReviews
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.customerId || x.customerId === filters.customerId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.requestedAt).localeCompare(String(a.requestedAt)));
    },
    evaluateTransfer(id) {
      const data = ensureResidency(store.read());
      const review = data.dataTransferReviews.find(x => x.id === id);
      if (!review) return null;
      const assignment = data.dataRegionAssignments.find(x => x.customerId === review.customerId && x.status === 'active');
      const policy = data.dataResidencyPolicies.find(x => x.id === (assignment && assignment.policyId)) || data.dataResidencyPolicies.find(x => x.tenantId === review.tenantId && x.status === 'active');
      return svc.evaluateTransfer(policy, review);
    },
    approveTransfer(id, reviewedBy) {
      const data = ensureResidency(store.read());
      const idx = data.dataTransferReviews.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.dataTransferReviews[idx] = svc.approveTransfer(data.dataTransferReviews[idx], reviewedBy);
      store.write(data);
      return data.dataTransferReviews[idx];
    },
    rejectTransfer(id, reviewedBy, reason = '') {
      const data = ensureResidency(store.read());
      const idx = data.dataTransferReviews.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.dataTransferReviews[idx] = svc.rejectTransfer(data.dataTransferReviews[idx], reviewedBy, reason);
      store.write(data);
      return data.dataTransferReviews[idx];
    },
    completeTransfer(id) {
      const data = ensureResidency(store.read());
      const idx = data.dataTransferReviews.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.dataTransferReviews[idx] = svc.completeTransfer(data.dataTransferReviews[idx]);
      store.write(data);
      return data.dataTransferReviews[idx];
    },
    createRequirement(input) {
      const data = ensureResidency(store.read());
      const row = { id: makeId('locreq'), ...svc.normalizeRequirementInput(input), createdAt: now(), updatedAt: now() };
      data.dataLocalizationRequirements.push(row);
      store.write(data);
      return row;
    },
    listRequirements(filters = {}) {
      return ensureResidency(store.read()).dataLocalizationRequirements
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.regionCode || x.regionCode === filters.regionCode)
        .filter(x => !filters.status || x.status === filters.status);
    },
    satisfyRequirement(id) {
      const data = ensureResidency(store.read());
      const idx = data.dataLocalizationRequirements.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.dataLocalizationRequirements[idx] = svc.satisfyRequirement(data.dataLocalizationRequirements[idx]);
      store.write(data);
      return data.dataLocalizationRequirements[idx];
    },
    createViolation(input) {
      const data = ensureResidency(store.read());
      const row = { id: makeId('resvio'), ...svc.normalizeViolationInput(input), createdAt: now(), updatedAt: now() };
      data.dataResidencyViolations.push(row);
      store.write(data);
      return row;
    },
    listViolations(filters = {}) {
      return ensureResidency(store.read()).dataResidencyViolations
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.customerId || x.customerId === filters.customerId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.detectedAt).localeCompare(String(a.detectedAt)));
    },
    remediateViolation(id) {
      const data = ensureResidency(store.read());
      const idx = data.dataResidencyViolations.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.dataResidencyViolations[idx] = svc.remediateViolation(data.dataResidencyViolations[idx]);
      store.write(data);
      return data.dataResidencyViolations[idx];
    },
    closeViolation(id) {
      const data = ensureResidency(store.read());
      const idx = data.dataResidencyViolations.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.dataResidencyViolations[idx] = svc.closeViolation(data.dataResidencyViolations[idx]);
      store.write(data);
      return data.dataResidencyViolations[idx];
    },
    createApproval(input) {
      const data = ensureResidency(store.read());
      const row = { id: makeId('resapp'), ...svc.normalizeApprovalInput(input), createdAt: now(), updatedAt: now() };
      data.dataTransferApprovals.push(row);
      store.write(data);
      return row;
    },
    approveReviewApproval(id, comments = '') {
      const data = ensureResidency(store.read());
      const idx = data.dataTransferApprovals.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.dataTransferApprovals[idx] = svc.approveReviewApproval(data.dataTransferApprovals[idx], comments);
      store.write(data);
      return data.dataTransferApprovals[idx];
    },
    rejectReviewApproval(id, comments = '') {
      const data = ensureResidency(store.read());
      const idx = data.dataTransferApprovals.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.dataTransferApprovals[idx] = svc.rejectReviewApproval(data.dataTransferApprovals[idx], comments);
      store.write(data);
      return data.dataTransferApprovals[idx];
    },
    metrics(tenantId) {
      const data = ensureResidency(store.read());
      return svc.residencyMetrics({
        policies: data.dataResidencyPolicies.filter(x => !tenantId || x.tenantId === tenantId),
        assignments: data.dataRegionAssignments.filter(x => !tenantId || x.tenantId === tenantId),
        transfers: data.dataTransferReviews.filter(x => !tenantId || x.tenantId === tenantId),
        requirements: data.dataLocalizationRequirements.filter(x => !tenantId || x.tenantId === tenantId),
        violations: data.dataResidencyViolations.filter(x => !tenantId || x.tenantId === tenantId)
      });
    }
  };
}

function createPostgresDataResidencyRepository() {
  return {
    async listPolicies() { return []; },
    async createPolicy(input) { return { id: 'postgres-residency-policy-placeholder', ...svc.normalizePolicyInput(input) }; },
    async listAssignments() { return []; },
    async createAssignment(input) { return { id: 'postgres-region-assignment-placeholder', ...svc.normalizeRegionAssignmentInput(input) }; },
    async createTransferReview(input) { return { id: 'postgres-transfer-placeholder', ...svc.normalizeTransferReviewInput(input) }; },
    async listTransferReviews() { return []; },
    async evaluateTransfer() { return null; },
    async approveTransfer() { return null; },
    async rejectTransfer() { return null; },
    async completeTransfer() { return null; },
    async createRequirement(input) { return { id: 'postgres-requirement-placeholder', ...svc.normalizeRequirementInput(input) }; },
    async listRequirements() { return []; },
    async satisfyRequirement() { return null; },
    async createViolation(input) { return { id: 'postgres-violation-placeholder', ...svc.normalizeViolationInput(input) }; },
    async listViolations() { return []; },
    async remediateViolation() { return null; },
    async closeViolation() { return null; },
    async createApproval(input) { return { id: 'postgres-approval-placeholder', ...svc.normalizeApprovalInput(input) }; },
    async approveReviewApproval() { return null; },
    async rejectReviewApproval() { return null; },
    async metrics() { return svc.residencyMetrics({}); }
  };
}

module.exports = { createDataResidencyRepository };
