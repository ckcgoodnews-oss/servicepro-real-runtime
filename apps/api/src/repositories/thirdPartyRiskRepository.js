const { makeId, now } = require('../services/id');
const svc = require('../services/thirdPartyRiskService');

function createThirdPartyRiskRepository(store) {
  if (store.type === 'json') return createJsonThirdPartyRiskRepository(store);
  if (store.type === 'postgres') return createPostgresThirdPartyRiskRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureTpr(data) {
  data.tprVendors ||= [];
  data.tprAssessments ||= [];
  data.tprQuestionnaireResponses ||= [];
  data.tprFindings ||= [];
  data.tprRemediationTasks ||= [];
  data.tprExceptions ||= [];
  return data;
}

function createJsonThirdPartyRiskRepository(store) {
  return {
    listVendors(filters = {}) {
      return ensureTpr(store.read()).tprVendors
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.criticality || x.criticality === filters.criticality)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    createVendor(input) {
      const data = ensureTpr(store.read());
      const row = { id: makeId('vendor'), ...svc.normalizeVendorInput(input), createdAt: now(), updatedAt: now() };
      data.tprVendors.push(row);
      store.write(data);
      return row;
    },
    createAssessment(input) {
      const data = ensureTpr(store.read());
      const row = { id: makeId('tpassess'), ...svc.normalizeAssessmentInput(input), createdAt: now(), updatedAt: now() };
      data.tprAssessments.push(row);
      store.write(data);
      return row;
    },
    listAssessments(vendorId) {
      return ensureTpr(store.read()).tprAssessments.filter(x => x.vendorId === vendorId).sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)));
    },
    completeAssessment(id) {
      const data = ensureTpr(store.read());
      const idx = data.tprAssessments.findIndex(x => x.id === id);
      if (idx === -1) return null;
      const assessment = data.tprAssessments[idx];
      const vendor = data.tprVendors.find(x => x.id === assessment.vendorId) || {};
      const findings = data.tprFindings.filter(x => x.assessmentId === id);
      const responses = data.tprQuestionnaireResponses.filter(x => x.assessmentId === id);
      data.tprAssessments[idx] = svc.completeAssessment(assessment, responses, findings, vendor);
      store.write(data);
      return data.tprAssessments[idx];
    },
    createResponse(input) {
      const data = ensureTpr(store.read());
      const row = { id: makeId('tpresp'), ...svc.normalizeQuestionnaireResponseInput(input), createdAt: now(), updatedAt: now() };
      data.tprQuestionnaireResponses.push(row);
      store.write(data);
      return row;
    },
    listResponses(assessmentId) {
      return ensureTpr(store.read()).tprQuestionnaireResponses.filter(x => x.assessmentId === assessmentId);
    },
    createFinding(input) {
      const data = ensureTpr(store.read());
      const row = { id: makeId('tpfinding'), ...svc.normalizeFindingInput(input), createdAt: now(), updatedAt: now() };
      data.tprFindings.push(row);
      store.write(data);
      return row;
    },
    listFindings(filters = {}) {
      return ensureTpr(store.read()).tprFindings
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.vendorId || x.vendorId === filters.vendorId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.severity || x.severity === filters.severity)
        .sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)));
    },
    transitionFinding(id, status) {
      const data = ensureTpr(store.read());
      const idx = data.tprFindings.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.tprFindings[idx] = svc.transitionFinding(data.tprFindings[idx], status);
      store.write(data);
      return data.tprFindings[idx];
    },
    createRemediationTask(input) {
      const data = ensureTpr(store.read());
      const row = { id: makeId('tpremed'), ...svc.normalizeRemediationTaskInput(input), createdAt: now(), updatedAt: now() };
      data.tprRemediationTasks.push(row);
      store.write(data);
      return row;
    },
    listRemediationTasks(findingId) {
      return ensureTpr(store.read()).tprRemediationTasks.filter(x => x.findingId === findingId);
    },
    completeRemediationTask(id) {
      const data = ensureTpr(store.read());
      const idx = data.tprRemediationTasks.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.tprRemediationTasks[idx] = svc.completeRemediation(data.tprRemediationTasks[idx]);
      store.write(data);
      return data.tprRemediationTasks[idx];
    },
    createException(input) {
      const data = ensureTpr(store.read());
      const row = { id: makeId('tpexcept'), ...svc.normalizeExceptionInput(input), createdAt: now(), updatedAt: now() };
      data.tprExceptions.push(row);
      store.write(data);
      return row;
    },
    approveException(id, approvedBy) {
      const data = ensureTpr(store.read());
      const idx = data.tprExceptions.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.tprExceptions[idx] = svc.approveException(data.tprExceptions[idx], approvedBy);
      const findingIdx = data.tprFindings.findIndex(x => x.id === data.tprExceptions[idx].findingId);
      if (findingIdx !== -1) data.tprFindings[findingIdx] = svc.transitionFinding(data.tprFindings[findingIdx], 'risk_accepted');
      store.write(data);
      return data.tprExceptions[idx];
    },
    rejectException(id, approvedBy) {
      const data = ensureTpr(store.read());
      const idx = data.tprExceptions.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.tprExceptions[idx] = svc.rejectException(data.tprExceptions[idx], approvedBy);
      store.write(data);
      return data.tprExceptions[idx];
    },
    vendorRisk(vendorId) {
      const data = ensureTpr(store.read());
      const vendor = data.tprVendors.find(x => x.id === vendorId);
      if (!vendor) return null;
      const findings = data.tprFindings.filter(x => x.vendorId === vendorId);
      const assessments = data.tprAssessments.filter(x => x.vendorId === vendorId);
      const assessmentIds = new Set(assessments.map(x => x.id));
      const responses = data.tprQuestionnaireResponses.filter(x => assessmentIds.has(x.assessmentId));
      return svc.calculateVendorRisk(vendor, findings, responses);
    },
    metrics(tenantId) {
      const data = ensureTpr(store.read());
      const vendors = data.tprVendors.filter(x => !tenantId || x.tenantId === tenantId);
      const findings = data.tprFindings.filter(x => !tenantId || x.tenantId === tenantId);
      return svc.vendorMetrics(vendors, findings);
    }
  };
}

function createPostgresThirdPartyRiskRepository() {
  return {
    async listVendors() { return []; },
    async createVendor(input) { return { id: 'postgres-vendor-placeholder', ...svc.normalizeVendorInput(input) }; },
    async createAssessment(input) { return { id: 'postgres-assessment-placeholder', ...svc.normalizeAssessmentInput(input) }; },
    async listAssessments() { return []; },
    async completeAssessment() { return null; },
    async createResponse(input) { return { id: 'postgres-response-placeholder', ...svc.normalizeQuestionnaireResponseInput(input) }; },
    async listResponses() { return []; },
    async createFinding(input) { return { id: 'postgres-tpr-finding-placeholder', ...svc.normalizeFindingInput(input) }; },
    async listFindings() { return []; },
    async transitionFinding() { return null; },
    async createRemediationTask(input) { return { id: 'postgres-tpr-remed-placeholder', ...svc.normalizeRemediationTaskInput(input) }; },
    async listRemediationTasks() { return []; },
    async completeRemediationTask() { return null; },
    async createException(input) { return { id: 'postgres-tpr-exception-placeholder', ...svc.normalizeExceptionInput(input) }; },
    async approveException() { return null; },
    async rejectException() { return null; },
    async vendorRisk() { return null; },
    async metrics() { return svc.vendorMetrics([], []); }
  };
}

module.exports = { createThirdPartyRiskRepository };
