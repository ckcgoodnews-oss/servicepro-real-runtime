const { makeId, now } = require('../services/id');
const {
  normalizeSlaPolicyInput,
  normalizeSupportTicketInput,
  normalizeTicketCommentInput,
  normalizeEscalationInput,
  normalizeKnowledgeArticleInput,
  normalizeCustomerHealthSignalInput,
  transitionTicket,
  markFirstResponse,
  evaluateTicketSla,
  acknowledgeEscalation,
  resolveEscalation,
  calculateCustomerHealth
} = require('../services/supportService');

function createSupportRepository(store) {
  if (store.type === 'json') return createJsonSupportRepository(store);
  if (store.type === 'postgres') return createPostgresSupportRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureSupport(data) {
  if (!data.supportSlaPolicies) data.supportSlaPolicies = [];
  if (!data.supportTickets) data.supportTickets = [];
  if (!data.supportTicketComments) data.supportTicketComments = [];
  if (!data.supportEscalations) data.supportEscalations = [];
  if (!data.knowledgeArticles) data.knowledgeArticles = [];
  if (!data.customerHealthSignals) data.customerHealthSignals = [];
  return data;
}

function createJsonSupportRepository(store) {
  return {
    listSlaPolicies(filters = {}) {
      return ensureSupport(store.read()).supportSlaPolicies
        .filter(x => filters.active === undefined || x.active === filters.active)
        .filter(x => !filters.priority || x.priority === filters.priority)
        .sort((a, b) => String(a.priority).localeCompare(String(b.priority)));
    },
    createSlaPolicy(input) {
      const data = ensureSupport(store.read());
      const row = { id: makeId('supsla'), ...normalizeSlaPolicyInput(input), createdAt: now(), updatedAt: now() };
      data.supportSlaPolicies.push(row);
      store.write(data);
      return row;
    },
    listTickets(filters = {}) {
      return ensureSupport(store.read()).supportTickets
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.priority || x.priority === filters.priority)
        .sort((a, b) => String(b.openedAt).localeCompare(String(a.openedAt)));
    },
    createTicket(input) {
      const data = ensureSupport(store.read());
      const row = { id: makeId('ticket'), ...normalizeSupportTicketInput(input), createdAt: now(), updatedAt: now() };
      row.ticketNumber = row.ticketNumber || `SUP-${String(data.supportTickets.length + 1).padStart(6, '0')}`;
      data.supportTickets.push(row);
      store.write(data);
      return row;
    },
    transitionTicket(id, status) {
      const data = ensureSupport(store.read());
      const idx = data.supportTickets.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.supportTickets[idx] = transitionTicket(data.supportTickets[idx], status);
      store.write(data);
      return data.supportTickets[idx];
    },
    markFirstResponse(id) {
      const data = ensureSupport(store.read());
      const idx = data.supportTickets.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.supportTickets[idx] = markFirstResponse(data.supportTickets[idx]);
      store.write(data);
      return data.supportTickets[idx];
    },
    evaluateSla(id, asOf) {
      const data = ensureSupport(store.read());
      const ticket = data.supportTickets.find(x => x.id === id);
      if (!ticket) return null;
      const policy = data.supportSlaPolicies.find(x => x.active !== false && x.priority === ticket.priority);
      return evaluateTicketSla({ ticket, policy, asOf });
    },
    listComments(ticketId) {
      return ensureSupport(store.read()).supportTicketComments
        .filter(x => x.ticketId === ticketId)
        .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
    },
    createComment(input) {
      const data = ensureSupport(store.read());
      const row = { id: makeId('supcom'), ...normalizeTicketCommentInput(input), updatedAt: now() };
      data.supportTicketComments.push(row);
      store.write(data);
      return row;
    },
    listEscalations(filters = {}) {
      return ensureSupport(store.read()).supportEscalations
        .filter(x => !filters.ticketId || x.ticketId === filters.ticketId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.escalatedAt).localeCompare(String(a.escalatedAt)));
    },
    createEscalation(input) {
      const data = ensureSupport(store.read());
      const row = { id: makeId('esc'), ...normalizeEscalationInput(input), createdAt: now(), updatedAt: now() };
      data.supportEscalations.push(row);
      store.write(data);
      return row;
    },
    acknowledgeEscalation(id, actor) {
      const data = ensureSupport(store.read());
      const idx = data.supportEscalations.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.supportEscalations[idx] = acknowledgeEscalation(data.supportEscalations[idx], actor);
      store.write(data);
      return data.supportEscalations[idx];
    },
    resolveEscalation(id, actor) {
      const data = ensureSupport(store.read());
      const idx = data.supportEscalations.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.supportEscalations[idx] = resolveEscalation(data.supportEscalations[idx], actor);
      store.write(data);
      return data.supportEscalations[idx];
    },
    listArticles(filters = {}) {
      return ensureSupport(store.read()).knowledgeArticles
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.category || x.category === filters.category)
        .sort((a, b) => String(a.title).localeCompare(String(b.title)));
    },
    createArticle(input) {
      const data = ensureSupport(store.read());
      const row = { id: makeId('kb'), ...normalizeKnowledgeArticleInput(input), createdAt: now(), updatedAt: now() };
      data.knowledgeArticles.push(row);
      store.write(data);
      return row;
    },
    recordHealthSignal(input) {
      const data = ensureSupport(store.read());
      const row = { id: makeId('chs'), ...normalizeCustomerHealthSignalInput(input), createdAt: now(), updatedAt: now() };
      data.customerHealthSignals.push(row);
      store.write(data);
      return row;
    },
    customerHealth(tenantId) {
      const signals = ensureSupport(store.read()).customerHealthSignals.filter(x => x.tenantId === tenantId);
      return calculateCustomerHealth(signals);
    }
  };
}

function createPostgresSupportRepository(store) {
  return {
    async listSlaPolicies() { return []; },
    async createSlaPolicy(input) { return { id: 'postgres-sla-placeholder', ...normalizeSlaPolicyInput(input) }; },
    async listTickets() { return []; },
    async createTicket(input) { return { id: 'postgres-ticket-placeholder', ...normalizeSupportTicketInput(input) }; },
    async transitionTicket() { return null; },
    async markFirstResponse() { return null; },
    async evaluateSla() { return null; },
    async listComments() { return []; },
    async createComment(input) { return { id: 'postgres-comment-placeholder', ...normalizeTicketCommentInput(input) }; },
    async listEscalations() { return []; },
    async createEscalation(input) { return { id: 'postgres-escalation-placeholder', ...normalizeEscalationInput(input) }; },
    async acknowledgeEscalation() { return null; },
    async resolveEscalation() { return null; },
    async listArticles() { return []; },
    async createArticle(input) { return { id: 'postgres-article-placeholder', ...normalizeKnowledgeArticleInput(input) }; },
    async recordHealthSignal(input) { return { id: 'postgres-health-placeholder', ...normalizeCustomerHealthSignalInput(input) }; },
    async customerHealth() { return calculateCustomerHealth([]); }
  };
}

module.exports = { createSupportRepository };
