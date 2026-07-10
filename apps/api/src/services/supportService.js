const { validationError } = require('../errors/domainError');

const TICKET_STATUSES = ['new', 'triaged', 'in_progress', 'waiting_on_customer', 'resolved', 'closed'];
const TICKET_PRIORITIES = ['low', 'normal', 'high', 'urgent'];
const TICKET_SEVERITIES = ['sev1', 'sev2', 'sev3', 'sev4'];
const ESCALATION_STATUSES = ['open', 'acknowledged', 'resolved', 'cancelled'];
const ARTICLE_STATUSES = ['draft', 'published', 'archived'];
const HEALTH_SIGNAL_TYPES = ['usage', 'billing', 'support', 'reliability', 'satisfaction', 'custom'];
const HEALTH_SIGNAL_DIRECTIONS = ['positive', 'neutral', 'negative'];

function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizeSlaPolicyInput(input = {}) {
  if (!input.name) throw validationError('name is required');
  const priority = input.priority || 'normal';
  if (!TICKET_PRIORITIES.includes(priority)) throw validationError(`Unsupported SLA priority: ${priority}`);
  return {
    code: input.code || slugCode(input.name),
    name: input.name,
    priority,
    firstResponseMinutes: Number(input.firstResponseMinutes || 240),
    resolutionMinutes: Number(input.resolutionMinutes || 2880),
    active: input.active !== false,
    metadata: input.metadata || {}
  };
}

function normalizeSupportTicketInput(input = {}) {
  if (!input.subject) throw validationError('subject is required');
  const status = input.status || 'new';
  const priority = input.priority || 'normal';
  const severity = input.severity || 'sev4';
  if (!TICKET_STATUSES.includes(status)) throw validationError(`Unsupported ticket status: ${status}`);
  if (!TICKET_PRIORITIES.includes(priority)) throw validationError(`Unsupported ticket priority: ${priority}`);
  if (!TICKET_SEVERITIES.includes(severity)) throw validationError(`Unsupported ticket severity: ${severity}`);
  return {
    ticketNumber: input.ticketNumber || '',
    tenantId: input.tenantId || '',
    customerId: input.customerId || '',
    requesterName: input.requesterName || '',
    requesterEmail: input.requesterEmail || '',
    subject: input.subject,
    description: input.description || '',
    status,
    priority,
    severity,
    assignedTeam: input.assignedTeam || 'support',
    assignedTo: input.assignedTo || '',
    source: input.source || 'manual',
    openedAt: input.openedAt || new Date().toISOString(),
    firstResponseAt: input.firstResponseAt || '',
    resolvedAt: input.resolvedAt || '',
    closedAt: input.closedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeTicketCommentInput(input = {}) {
  if (!input.ticketId) throw validationError('ticketId is required');
  if (!input.body) throw validationError('body is required');
  return {
    ticketId: input.ticketId,
    authorId: input.authorId || '',
    authorName: input.authorName || '',
    body: input.body,
    internal: input.internal === true,
    createdAt: input.createdAt || new Date().toISOString(),
    metadata: input.metadata || {}
  };
}

function normalizeEscalationInput(input = {}) {
  if (!input.ticketId) throw validationError('ticketId is required');
  if (!input.reason) throw validationError('reason is required');
  const status = input.status || 'open';
  if (!ESCALATION_STATUSES.includes(status)) throw validationError(`Unsupported escalation status: ${status}`);
  return {
    ticketId: input.ticketId,
    status,
    reason: input.reason,
    escalatedBy: input.escalatedBy || '',
    escalatedTo: input.escalatedTo || 'support-lead',
    escalatedAt: input.escalatedAt || new Date().toISOString(),
    acknowledgedBy: input.acknowledgedBy || '',
    acknowledgedAt: input.acknowledgedAt || '',
    resolvedBy: input.resolvedBy || '',
    resolvedAt: input.resolvedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeKnowledgeArticleInput(input = {}) {
  if (!input.title) throw validationError('title is required');
  if (!input.body) throw validationError('body is required');
  const status = input.status || 'draft';
  if (!ARTICLE_STATUSES.includes(status)) throw validationError(`Unsupported article status: ${status}`);
  return {
    slug: input.slug || slugCode(input.title).toLowerCase(),
    title: input.title,
    body: input.body,
    status,
    category: input.category || 'general',
    tags: Array.isArray(input.tags) ? input.tags : [],
    createdBy: input.createdBy || '',
    publishedAt: input.publishedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeCustomerHealthSignalInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.signalType) throw validationError('signalType is required');
  const direction = input.direction || 'neutral';
  if (!HEALTH_SIGNAL_TYPES.includes(input.signalType)) throw validationError(`Unsupported health signal type: ${input.signalType}`);
  if (!HEALTH_SIGNAL_DIRECTIONS.includes(direction)) throw validationError(`Unsupported health signal direction: ${direction}`);
  return {
    tenantId: input.tenantId,
    signalType: input.signalType,
    direction,
    scoreDelta: Number(input.scoreDelta || 0),
    description: input.description || '',
    sourceId: input.sourceId || '',
    sourceType: input.sourceType || '',
    observedAt: input.observedAt || new Date().toISOString(),
    metadata: input.metadata || {}
  };
}

function minutesBetween(start, end) {
  const a = new Date(start);
  const b = new Date(end);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  return Math.floor((b.getTime() - a.getTime()) / 60000);
}

function transitionTicket(ticket, status, at = new Date().toISOString()) {
  if (!TICKET_STATUSES.includes(status)) throw validationError(`Unsupported ticket status: ${status}`);
  const next = { ...ticket, status, updatedAt: at };
  if (status === 'resolved' && !next.resolvedAt) next.resolvedAt = at;
  if (status === 'closed' && !next.closedAt) next.closedAt = at;
  return next;
}

function markFirstResponse(ticket, at = new Date().toISOString()) {
  return { ...ticket, firstResponseAt: at, status: ticket.status === 'new' ? 'triaged' : ticket.status, updatedAt: at };
}

function evaluateTicketSla({ ticket, policy, asOf = new Date().toISOString() }) {
  if (!ticket || !policy) return { breached: false, reason: 'Ticket or SLA policy missing', firstResponseBreached: false, resolutionBreached: false };
  const firstResponseMinutes = ticket.firstResponseAt ? minutesBetween(ticket.openedAt, ticket.firstResponseAt) : minutesBetween(ticket.openedAt, asOf);
  const resolutionMinutes = ticket.resolvedAt ? minutesBetween(ticket.openedAt, ticket.resolvedAt) : minutesBetween(ticket.openedAt, asOf);
  const firstResponseBreached = firstResponseMinutes !== null && firstResponseMinutes > Number(policy.firstResponseMinutes || 0);
  const resolutionBreached = !['resolved', 'closed'].includes(ticket.status) && resolutionMinutes !== null && resolutionMinutes > Number(policy.resolutionMinutes || 0);
  return {
    breached: firstResponseBreached || resolutionBreached,
    firstResponseBreached,
    resolutionBreached,
    firstResponseMinutes,
    resolutionMinutes,
    firstResponseTargetMinutes: Number(policy.firstResponseMinutes || 0),
    resolutionTargetMinutes: Number(policy.resolutionMinutes || 0)
  };
}

function acknowledgeEscalation(escalation, actor, at = new Date().toISOString()) {
  if (!actor) throw validationError('actor is required');
  return { ...escalation, status: 'acknowledged', acknowledgedBy: actor, acknowledgedAt: at, updatedAt: at };
}

function resolveEscalation(escalation, actor, at = new Date().toISOString()) {
  if (!actor) throw validationError('actor is required');
  return { ...escalation, status: 'resolved', resolvedBy: actor, resolvedAt: at, updatedAt: at };
}

function calculateCustomerHealth(signals = []) {
  const raw = signals.reduce((sum, signal) => sum + Number(signal.scoreDelta || 0), 70);
  const score = Math.max(0, Math.min(100, raw));
  return {
    score,
    status: score >= 80 ? 'healthy' : score >= 60 ? 'watch' : score >= 40 ? 'at_risk' : 'critical',
    signalCount: signals.length
  };
}

module.exports = {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_SEVERITIES,
  ESCALATION_STATUSES,
  ARTICLE_STATUSES,
  HEALTH_SIGNAL_TYPES,
  HEALTH_SIGNAL_DIRECTIONS,
  slugCode,
  normalizeSlaPolicyInput,
  normalizeSupportTicketInput,
  normalizeTicketCommentInput,
  normalizeEscalationInput,
  normalizeKnowledgeArticleInput,
  normalizeCustomerHealthSignalInput,
  minutesBetween,
  transitionTicket,
  markFirstResponse,
  evaluateTicketSla,
  acknowledgeEscalation,
  resolveEscalation,
  calculateCustomerHealth
};
