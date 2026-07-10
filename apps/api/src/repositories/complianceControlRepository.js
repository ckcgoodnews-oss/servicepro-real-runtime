const { makeId, now } = require('../services/id');
const svc = require('../services/complianceControlService');

function createComplianceControlRepository(store) {
  if (store.type === 'json') return createJsonComplianceControlRepository(store);
  if (store.type === 'postgres') return createPostgresComplianceControlRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureControls(data) {
  data.complianceFrameworks ||= [];
  data.complianceControls ||= [];
  data.complianceEvidenceMappings ||= [];
  data.complianceTestRuns ||= [];
  data.complianceGaps ||= [];
  data.complianceCorrectiveActions ||= [];
  return data;
}

function createJsonComplianceControlRepository(store) {
  return {
    listFrameworks(filters = {}) {
      return ensureControls(store.read()).complianceFrameworks
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    createFramework(input) {
      const data = ensureControls(store.read());
      const row = { id: makeId('framework'), ...svc.normalizeFrameworkInput(input), createdAt: now(), updatedAt: now() };
      data.complianceFrameworks.push(row);
      store.write(data);
      return row;
    },
    listControls(filters = {}) {
      return ensureControls(store.read()).complianceControls
        .filter(x => !filters.frameworkId || x.frameworkId === filters.frameworkId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.controlCode).localeCompare(String(b.controlCode)));
    },
    createControl(input) {
      const data = ensureControls(store.read());
      const row = { id: makeId('control'), ...svc.normalizeControlInput(input), createdAt: now(), updatedAt: now() };
      data.complianceControls.push(row);
      store.write(data);
      return row;
    },
    listEvidence(controlId) {
      return ensureControls(store.read()).complianceEvidenceMappings
        .filter(x => x.controlId === controlId)
        .sort((a, b) => String(b.collectedAt).localeCompare(String(a.collectedAt)));
    },
    createEvidence(input) {
      const data = ensureControls(store.read());
      const row = { id: makeId('evidence'), ...svc.normalizeEvidenceMappingInput(input), createdAt: now(), updatedAt: now() };
      data.complianceEvidenceMappings.push(row);
      store.write(data);
      return row;
    },
    createTestRun(input) {
      const data = ensureControls(store.read());
      const row = { id: makeId('testrun'), ...svc.normalizeTestRunInput(input), createdAt: now(), updatedAt: now() };
      data.complianceTestRuns.push(row);
      store.write(data);
      return row;
    },
    listTestRuns(controlId) {
      return ensureControls(store.read()).complianceTestRuns
        .filter(x => x.controlId === controlId)
        .sort((a, b) => String(b.plannedAt).localeCompare(String(a.plannedAt)));
    },
    startTestRun(id) {
      const data = ensureControls(store.read());
      const idx = data.complianceTestRuns.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.complianceTestRuns[idx] = svc.startTestRun(data.complianceTestRuns[idx]);
      store.write(data);
      return data.complianceTestRuns[idx];
    },
    completeTestRun(id, passed, resultSummary = '') {
      const data = ensureControls(store.read());
      const idx = data.complianceTestRuns.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.complianceTestRuns[idx] = svc.completeTestRun(data.complianceTestRuns[idx], passed, resultSummary);
      store.write(data);
      return data.complianceTestRuns[idx];
    },
    listGaps(filters = {}) {
      return ensureControls(store.read()).complianceGaps
        .filter(x => !filters.controlId || x.controlId === filters.controlId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.severity || x.severity === filters.severity)
        .sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)));
    },
    createGap(input) {
      const data = ensureControls(store.read());
      const row = { id: makeId('gap'), ...svc.normalizeGapInput(input), createdAt: now(), updatedAt: now() };
      data.complianceGaps.push(row);
      store.write(data);
      return row;
    },
    closeGap(id) {
      const data = ensureControls(store.read());
      const idx = data.complianceGaps.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.complianceGaps[idx] = svc.closeGap(data.complianceGaps[idx]);
      store.write(data);
      return data.complianceGaps[idx];
    },
    acceptGap(id) {
      const data = ensureControls(store.read());
      const idx = data.complianceGaps.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.complianceGaps[idx] = svc.acceptGap(data.complianceGaps[idx]);
      store.write(data);
      return data.complianceGaps[idx];
    },
    createCorrectiveAction(input) {
      const data = ensureControls(store.read());
      const row = { id: makeId('corract'), ...svc.normalizeCorrectiveActionInput(input), createdAt: now(), updatedAt: now() };
      data.complianceCorrectiveActions.push(row);
      store.write(data);
      return row;
    },
    listCorrectiveActions(gapId) {
      return ensureControls(store.read()).complianceCorrectiveActions.filter(x => x.gapId === gapId);
    },
    completeCorrectiveAction(id) {
      const data = ensureControls(store.read());
      const idx = data.complianceCorrectiveActions.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.complianceCorrectiveActions[idx] = svc.completeCorrectiveAction(data.complianceCorrectiveActions[idx]);
      store.write(data);
      return data.complianceCorrectiveActions[idx];
    },
    coverage(frameworkId) {
      const data = ensureControls(store.read());
      const controls = data.complianceControls.filter(x => !frameworkId || x.frameworkId === frameworkId);
      const controlIds = new Set(controls.map(x => x.id));
      return svc.controlCoverage({
        controls,
        evidenceMappings: data.complianceEvidenceMappings.filter(x => controlIds.has(x.controlId)),
        testRuns: data.complianceTestRuns.filter(x => controlIds.has(x.controlId)),
        gaps: data.complianceGaps.filter(x => controlIds.has(x.controlId))
      });
    }
  };
}

function createPostgresComplianceControlRepository() {
  return {
    async listFrameworks() { return []; },
    async createFramework(input) { return { id: 'postgres-framework-placeholder', ...svc.normalizeFrameworkInput(input) }; },
    async listControls() { return []; },
    async createControl(input) { return { id: 'postgres-control-placeholder', ...svc.normalizeControlInput(input) }; },
    async listEvidence() { return []; },
    async createEvidence(input) { return { id: 'postgres-evidence-placeholder', ...svc.normalizeEvidenceMappingInput(input) }; },
    async createTestRun(input) { return { id: 'postgres-test-placeholder', ...svc.normalizeTestRunInput(input) }; },
    async listTestRuns() { return []; },
    async startTestRun() { return null; },
    async completeTestRun() { return null; },
    async listGaps() { return []; },
    async createGap(input) { return { id: 'postgres-gap-placeholder', ...svc.normalizeGapInput(input) }; },
    async closeGap() { return null; },
    async acceptGap() { return null; },
    async createCorrectiveAction(input) { return { id: 'postgres-action-placeholder', ...svc.normalizeCorrectiveActionInput(input) }; },
    async listCorrectiveActions() { return []; },
    async completeCorrectiveAction() { return null; },
    async coverage() { return svc.controlCoverage({}); }
  };
}

module.exports = { createComplianceControlRepository };
