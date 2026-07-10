const { makeId, now } = require('../services/id');
const {
  normalizeAgreementInput,
  normalizeOrderFormInput,
  normalizeContractTermInput,
  normalizeAmendmentInput,
  normalizeObligationInput,
  activateAgreement,
  terminateAgreement,
  executeAmendment,
  fulfillObligation,
  calculateOrderFormTotal,
  evaluateRenewalWindow,
  summarizeContractPortfolio
} = require('../services/contractService');

function createContractRepository(store) {
  if (store.type === 'json') return createJsonContractRepository(store);
  if (store.type === 'postgres') return createPostgresContractRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureContracts(data) {
  if (!data.contractAgreements) data.contractAgreements = [];
  if (!data.contractOrderForms) data.contractOrderForms = [];
  if (!data.contractTerms) data.contractTerms = [];
  if (!data.contractAmendments) data.contractAmendments = [];
  if (!data.contractObligations) data.contractObligations = [];
  return data;
}

function createJsonContractRepository(store) {
  return {
    listAgreements(filters = {}) {
      return ensureContracts(store.read()).contractAgreements
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    createAgreement(input) {
      const data = ensureContracts(store.read());
      const row = { id: makeId('ctr'), ...normalizeAgreementInput(input), createdAt: now(), updatedAt: now() };
      data.contractAgreements.push(row);
      store.write(data);
      return row;
    },
    activateAgreement(id) {
      const data = ensureContracts(store.read());
      const idx = data.contractAgreements.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.contractAgreements[idx] = activateAgreement(data.contractAgreements[idx]);
      store.write(data);
      return data.contractAgreements[idx];
    },
    terminateAgreement(id) {
      const data = ensureContracts(store.read());
      const idx = data.contractAgreements.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.contractAgreements[idx] = terminateAgreement(data.contractAgreements[idx]);
      store.write(data);
      return data.contractAgreements[idx];
    },
    listOrderForms(agreementId) {
      return ensureContracts(store.read()).contractOrderForms
        .filter(x => x.agreementId === agreementId)
        .sort((a, b) => String(b.startDate).localeCompare(String(a.startDate)));
    },
    createOrderForm(input) {
      const data = ensureContracts(store.read());
      const row = { id: makeId('ordform'), ...normalizeOrderFormInput(input), createdAt: now(), updatedAt: now() };
      data.contractOrderForms.push(row);
      store.write(data);
      return row;
    },
    listTerms(agreementId) {
      return ensureContracts(store.read()).contractTerms
        .filter(x => x.agreementId === agreementId)
        .sort((a, b) => String(a.termType).localeCompare(String(b.termType)));
    },
    createTerm(input) {
      const data = ensureContracts(store.read());
      const row = { id: makeId('term'), ...normalizeContractTermInput(input), createdAt: now(), updatedAt: now() };
      data.contractTerms.push(row);
      store.write(data);
      return row;
    },
    listAmendments(agreementId) {
      return ensureContracts(store.read()).contractAmendments
        .filter(x => x.agreementId === agreementId)
        .sort((a, b) => String(b.effectiveDate).localeCompare(String(a.effectiveDate)));
    },
    createAmendment(input) {
      const data = ensureContracts(store.read());
      const row = { id: makeId('amend'), ...normalizeAmendmentInput(input), createdAt: now(), updatedAt: now() };
      data.contractAmendments.push(row);
      store.write(data);
      return row;
    },
    executeAmendment(id) {
      const data = ensureContracts(store.read());
      const idx = data.contractAmendments.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.contractAmendments[idx] = executeAmendment(data.contractAmendments[idx]);
      store.write(data);
      return data.contractAmendments[idx];
    },
    listObligations(filters = {}) {
      return ensureContracts(store.read()).contractObligations
        .filter(x => !filters.agreementId || x.agreementId === filters.agreementId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));
    },
    createObligation(input) {
      const data = ensureContracts(store.read());
      const row = { id: makeId('obligation'), ...normalizeObligationInput(input), createdAt: now(), updatedAt: now() };
      data.contractObligations.push(row);
      store.write(data);
      return row;
    },
    fulfillObligation(id, evidenceUrl = '') {
      const data = ensureContracts(store.read());
      const idx = data.contractObligations.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.contractObligations[idx] = fulfillObligation(data.contractObligations[idx], evidenceUrl);
      store.write(data);
      return data.contractObligations[idx];
    },
    renewalWindow(id, asOf) {
      const agreement = ensureContracts(store.read()).contractAgreements.find(x => x.id === id);
      return agreement ? evaluateRenewalWindow({ agreement, asOf }) : null;
    },
    value(id) {
      const orderForms = this.listOrderForms(id);
      return { agreementId: id, orderFormTotalCents: calculateOrderFormTotal(orderForms) };
    },
    portfolio(tenantId) {
      const data = ensureContracts(store.read());
      const agreements = data.contractAgreements.filter(x => !tenantId || x.tenantId === tenantId);
      const agreementIds = new Set(agreements.map(x => x.id));
      const obligations = data.contractObligations.filter(x => agreementIds.has(x.agreementId));
      return summarizeContractPortfolio(agreements, obligations);
    }
  };
}

function createPostgresContractRepository() {
  return {
    async listAgreements() { return []; },
    async createAgreement(input) { return { id: 'postgres-agreement-placeholder', ...normalizeAgreementInput(input) }; },
    async activateAgreement() { return null; },
    async terminateAgreement() { return null; },
    async listOrderForms() { return []; },
    async createOrderForm(input) { return { id: 'postgres-orderform-placeholder', ...normalizeOrderFormInput(input) }; },
    async listTerms() { return []; },
    async createTerm(input) { return { id: 'postgres-term-placeholder', ...normalizeContractTermInput(input) }; },
    async listAmendments() { return []; },
    async createAmendment(input) { return { id: 'postgres-amendment-placeholder', ...normalizeAmendmentInput(input) }; },
    async executeAmendment() { return null; },
    async listObligations() { return []; },
    async createObligation(input) { return { id: 'postgres-obligation-placeholder', ...normalizeObligationInput(input) }; },
    async fulfillObligation() { return null; },
    async renewalWindow() { return null; },
    async value(id) { return { agreementId: id, orderFormTotalCents: 0 }; },
    async portfolio() { return summarizeContractPortfolio([], []); }
  };
}

module.exports = { createContractRepository };
