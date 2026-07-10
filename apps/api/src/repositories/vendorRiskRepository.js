const { makeId, now } = require('../services/id');
const svc = require('../services/vendorRiskService');

function createVendorRiskRepository(store) {
  if (store.type === 'json') return createJsonVendorRiskRepository(store);
  if (store.type === 'postgres') return createPostgresVendorRiskRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureVendorRisk(data) {
  data.vendorRiskVendors ||= [];
  data.vendorRiskServices ||= [];
  data.vendorRiskAssessments ||= [];
  data.vendorRiskAttestations ||= [];
  data.vendorRiskRemediations ||= [];
  data.vendorRiskReviews ||= [];
  return data;
}

function createJsonVendorRiskRepository(store) {
  return {
    listVendors(filters = {}) {
      return ensureVendorRisk(store.read()).vendorRiskVendors
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.criticality || x.criticality === filters.criticality)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    createVendor(input) {
      const data = ensureVendorRisk(store.read());
      const row = { id: makeId('vendor'), ...svc.normalizeVendorInput(input), createdAt: now(), updatedAt: now() };
      data.vendorRiskVendors.push(row);
      store.write(data);
      return row;
    },
    activateVendor(id) {
      const data = ensureVendorRisk(store.read());
      const idx = data.vendorRiskVendors.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.vendorRiskVendors[idx] = svc.activateVendor(data.vendorRiskVendors[idx]);
      store.write(data);
      return data.vendorRiskVendors[idx];
    },
    suspendVendor(id) {
      const data = ensureVendorRisk(store.read());
      const idx = data.vendorRiskVendors.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.vendorRiskVendors[idx] = svc.suspendVendor(data.vendorRiskVendors[idx]);
      store.write(data);
      return data.vendorRiskVendors[idx];
    },
    createService(input) {
      const data = ensureVendorRisk(store.read());
      const row = { id: makeId('vsvc'), ...svc.normalizeServiceInput(input), createdAt: now(), updatedAt: now() };
      data.vendorRiskServices.push(row);
      store.write(data);
      return row;
    },
    listServices(vendorId) {
      return ensureVendorRisk(store.read()).vendorRiskServices.filter(x => x.vendorId === vendorId);
    },
    createAssessment(input) {
      const data = ensureVendorRisk(store.read());
      const vendor = data.vendorRiskVendors.find(x => x.id === input.vendorId);
      const services = data.vendorRiskServices.filter(x => x.vendorId === input.vendorId);
      const row = {
        id: makeId('vassess'),
        ...svc.normalizeAssessmentInput({ ...input, inherentRisk: input.inherentRisk || (vendor ? svc.deriveVendorRisk(vendor, services) : 'medium') }),
        createdAt: now(),
        updatedAt: now()
      };
      data.vendorRiskAssessments.push(row);
      store.write(data);
      return row;
    },
    listAssessments(filters = {}) {
      return ensureVendorRisk(store.read()).vendorRiskAssessments
        .filter(x => !filters.vendorId || x.vendorId === filters.vendorId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)));
    },
    submitAssessment(id, assessor) {
      const data = ensureVendorRisk(store.read());
      const idx = data.vendorRiskAssessments.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.vendorRiskAssessments[idx] = svc.submitAssessment(data.vendorRiskAssessments[idx], assessor);
      store.write(data);
      return data.vendorRiskAssessments[idx];
    },
    approveAssessment(id) {
      const data = ensureVendorRisk(store.read());
      const idx = data.vendorRiskAssessments.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.vendorRiskAssessments[idx] = svc.approveAssessment(data.vendorRiskAssessments[idx]);
      store.write(data);
      return data.vendorRiskAssessments[idx];
    },
    requireRemediation(id) {
      const data = ensureVendorRisk(store.read());
      const idx = data.vendorRiskAssessments.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.vendorRiskAssessments[idx] = svc.requireRemediation(data.vendorRiskAssessments[idx]);
      store.write(data);
      return data.vendorRiskAssessments[idx];
    },
    createAttestation(input) {
      const data = ensureVendorRisk(store.read());
      const row = { id: makeId('vatt'), ...svc.normalizeAttestationInput(input), createdAt: now(), updatedAt: now() };
      data.vendorRiskAttestations.push(row);
      store.write(data);
      return row;
    },
    receiveAttestation(id, documentUrl) {
      const data = ensureVendorRisk(store.read());
      const idx = data.vendorRiskAttestations.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.vendorRiskAttestations[idx] = svc.receiveAttestation(data.vendorRiskAttestations[idx], documentUrl);
      store.write(data);
      return data.vendorRiskAttestations[idx];
    },
    acceptAttestation(id, reviewedBy) {
      const data = ensureVendorRisk(store.read());
      const idx = data.vendorRiskAttestations.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.vendorRiskAttestations[idx] = svc.acceptAttestation(data.vendorRiskAttestations[idx], reviewedBy);
      store.write(data);
      return data.vendorRiskAttestations[idx];
    },
    rejectAttestation(id, reviewedBy, reason = '') {
      const data = ensureVendorRisk(store.read());
      const idx = data.vendorRiskAttestations.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.vendorRiskAttestations[idx] = svc.rejectAttestation(data.vendorRiskAttestations[idx], reviewedBy, reason);
      store.write(data);
      return data.vendorRiskAttestations[idx];
    },
    createRemediation(input) {
      const data = ensureVendorRisk(store.read());
      const row = { id: makeId('vrem'), ...svc.normalizeRemediationInput(input), createdAt: now(), updatedAt: now() };
      data.vendorRiskRemediations.push(row);
      store.write(data);
      return row;
    },
    completeRemediation(id) {
      const data = ensureVendorRisk(store.read());
      const idx = data.vendorRiskRemediations.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.vendorRiskRemediations[idx] = svc.completeRemediation(data.vendorRiskRemediations[idx]);
      store.write(data);
      return data.vendorRiskRemediations[idx];
    },
    createReview(input) {
      const data = ensureVendorRisk(store.read());
      const row = { id: makeId('vrev'), ...svc.normalizeReviewInput(input), createdAt: now(), updatedAt: now() };
      data.vendorRiskReviews.push(row);
      store.write(data);
      return row;
    },
    completeReview(id, notes = '') {
      const data = ensureVendorRisk(store.read());
      const idx = data.vendorRiskReviews.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.vendorRiskReviews[idx] = svc.completeReview(data.vendorRiskReviews[idx], notes);
      const vendorIdx = data.vendorRiskVendors.findIndex(x => x.id === data.vendorRiskReviews[idx].vendorId);
      if (vendorIdx !== -1) data.vendorRiskVendors[vendorIdx] = svc.applyReviewToVendor(data.vendorRiskVendors[vendorIdx], data.vendorRiskReviews[idx]);
      store.write(data);
      return data.vendorRiskReviews[idx];
    },
    metrics(tenantId) {
      const data = ensureVendorRisk(store.read());
      return svc.vendorRiskMetrics({
        vendors: data.vendorRiskVendors.filter(x => !tenantId || x.tenantId === tenantId),
        assessments: data.vendorRiskAssessments.filter(x => !tenantId || x.tenantId === tenantId),
        attestations: data.vendorRiskAttestations.filter(x => !tenantId || x.tenantId === tenantId),
        remediations: data.vendorRiskRemediations.filter(x => !tenantId || x.tenantId === tenantId),
        reviews: data.vendorRiskReviews.filter(x => !tenantId || x.tenantId === tenantId)
      });
    }
  };
}

function createPostgresVendorRiskRepository() {
  return {
    async listVendors() { return []; },
    async createVendor(input) { return { id: 'postgres-vendor-placeholder', ...svc.normalizeVendorInput(input) }; },
    async activateVendor() { return null; },
    async suspendVendor() { return null; },
    async createService(input) { return { id: 'postgres-service-placeholder', ...svc.normalizeServiceInput(input) }; },
    async listServices() { return []; },
    async createAssessment(input) { return { id: 'postgres-assessment-placeholder', ...svc.normalizeAssessmentInput(input) }; },
    async listAssessments() { return []; },
    async submitAssessment() { return null; },
    async approveAssessment() { return null; },
    async requireRemediation() { return null; },
    async createAttestation(input) { return { id: 'postgres-attestation-placeholder', ...svc.normalizeAttestationInput(input) }; },
    async receiveAttestation() { return null; },
    async acceptAttestation() { return null; },
    async rejectAttestation() { return null; },
    async createRemediation(input) { return { id: 'postgres-remediation-placeholder', ...svc.normalizeRemediationInput(input) }; },
    async completeRemediation() { return null; },
    async createReview(input) { return { id: 'postgres-review-placeholder', ...svc.normalizeReviewInput(input) }; },
    async completeReview() { return null; },
    async metrics() { return svc.vendorRiskMetrics({}); }
  };
}

module.exports = { createVendorRiskRepository };
