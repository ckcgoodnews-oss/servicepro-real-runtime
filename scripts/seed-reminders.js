const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const rule = await repos.reminders.createRule(tenantId, {
    name: 'Invoice follow-up',
    description: 'Follow up after an invoice has been sent',
    triggerType: 'invoice.sent',
    entityType: 'invoice',
    offsetDays: 3,
    defaultPriority: 'normal',
    defaultChannel: 'email'
  });

  const followUp = await repos.reminders.createFollowUp(tenantId, {
    customerId: 'cust_demo_1',
    entityType: 'invoice',
    entityId: 'inv_demo_1',
    invoiceId: 'inv_demo_1',
    title: 'Follow up on sent invoice',
    description: 'Call customer if payment has not been received.',
    dueDate: '2026-07-09',
    sourceRuleId: rule.id
  });

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, rule, followUp }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
