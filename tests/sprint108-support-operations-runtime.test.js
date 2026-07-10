const fs = require('fs');

const required = [
  'apps/api/src/services/supportService.js',
  'apps/api/src/repositories/supportRepository.js',
  'apps/api/src/routes/support.js',
  'scripts/seed-support-operations.js',
  'packages/database/postgres/108_support_operations_runtime.sql',
  'docs/sprint108-support-operations-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 108 patch file: ${file}`);
    process.exit(1);
  }
}

const {
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
} = require('../apps/api/src/services/supportService');

const sla = normalizeSlaPolicyInput({
  name: 'Urgent SLA',
  priority: 'urgent',
  firstResponseMinutes: 30,
  resolutionMinutes: 240
});
if (sla.code !== 'URGENT-SLA' || sla.priority !== 'urgent') process.exit(1);

let ticket = normalizeSupportTicketInput({
  subject: 'Mobile sync failure',
  priority: 'urgent',
  severity: 'sev2',
  openedAt: '2026-07-07T10:00:00.000Z'
});
ticket = markFirstResponse(ticket, '2026-07-07T10:15:00.000Z');
if (ticket.status !== 'triaged' || !ticket.firstResponseAt) process.exit(1);

const slaOk = evaluateTicketSla({ ticket, policy: sla, asOf: '2026-07-07T11:00:00.000Z' });
if (slaOk.firstResponseBreached !== false) process.exit(1);

const oldTicket = normalizeSupportTicketInput({
  subject: 'Old urgent issue',
  priority: 'urgent',
  openedAt: '2026-07-07T10:00:00.000Z'
});
const slaBad = evaluateTicketSla({ ticket: oldTicket, policy: sla, asOf: '2026-07-07T15:00:00.000Z' });
if (!slaBad.breached || !slaBad.resolutionBreached) process.exit(1);

ticket = transitionTicket(ticket, 'resolved', '2026-07-07T11:00:00.000Z');
if (ticket.status !== 'resolved' || !ticket.resolvedAt) process.exit(1);

const comment = normalizeTicketCommentInput({ ticketId: 'ticket1', body: 'Investigating.' });
if (comment.internal !== false) process.exit(1);

let escalation = normalizeEscalationInput({ ticketId: 'ticket1', reason: 'SLA risk' });
escalation = acknowledgeEscalation(escalation, 'lead');
escalation = resolveEscalation(escalation, 'lead');
if (escalation.status !== 'resolved') process.exit(1);

const article = normalizeKnowledgeArticleInput({ title: 'Mobile Sync Troubleshooting', body: 'Check network.' });
if (article.slug !== 'mobile-sync-troubleshooting') process.exit(1);

const signal = normalizeCustomerHealthSignalInput({
  tenantId: 'tenant_demo',
  signalType: 'support',
  direction: 'negative',
  scoreDelta: -15
});
const health = calculateCustomerHealth([signal]);
if (health.score !== 55 || health.status !== 'at_risk') process.exit(1);

if (minutesBetween('2026-07-07T10:00:00Z', '2026-07-07T10:30:00Z') !== 30) process.exit(1);

console.log('Sprint 108 support operations runtime patch test passed.');
