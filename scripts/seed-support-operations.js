const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const sla = await repos.support.createSlaPolicy({
    name: 'Urgent Support SLA',
    priority: 'urgent',
    firstResponseMinutes: 30,
    resolutionMinutes: 240
  });

  const ticket = await repos.support.createTicket({
    tenantId,
    requesterName: 'Operations Manager',
    requesterEmail: 'ops@example.com',
    subject: 'Mobile sync is failing for field technicians',
    description: 'Several technicians report sync errors while offline.',
    priority: 'urgent',
    severity: 'sev2',
    source: 'portal'
  });

  const responded = await repos.support.markFirstResponse(ticket.id);

  const comment = await repos.support.createComment({
    ticketId: ticket.id,
    authorName: 'Support Agent',
    body: 'We are investigating the mobile sync queue.',
    internal: false
  });

  const escalation = await repos.support.createEscalation({
    ticketId: ticket.id,
    reason: 'Urgent customer impact',
    escalatedBy: 'support-agent',
    escalatedTo: 'support-lead'
  });

  const article = await repos.support.createArticle({
    title: 'Troubleshooting Mobile Sync',
    body: 'Check device clock, offline queue, and connectivity status.',
    status: 'published',
    category: 'mobile',
    tags: ['mobile', 'sync']
  });

  const healthSignal = await repos.support.recordHealthSignal({
    tenantId,
    signalType: 'support',
    direction: 'negative',
    scoreDelta: -10,
    description: 'Urgent support ticket opened',
    sourceType: 'support_ticket',
    sourceId: ticket.id
  });

  const health = await repos.support.customerHealth(tenantId);
  const slaCheck = await repos.support.evaluateSla(ticket.id);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, sla, ticket: responded, comment, escalation, article, healthSignal, health, slaCheck }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
