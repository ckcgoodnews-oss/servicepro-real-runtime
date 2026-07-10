const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const thread = await repos.communicationCenter.createThread(tenantId, {
    subject: 'Customer follow-up for completed job',
    channel: 'email',
    priority: 'normal',
    customerId: 'cust_demo_1',
    jobId: 'job_demo_1',
    participants: [
      { type: 'customer', id: 'cust_demo_1', displayName: 'Demo Customer', email: 'customer@example.com' }
    ],
    tags: ['follow-up']
  });

  const inbound = await repos.communicationCenter.createMessage(tenantId, {
    threadId: thread.id,
    channel: 'email',
    direction: 'inbound',
    status: 'received',
    fromName: 'Demo Customer',
    fromAddress: 'customer@example.com',
    to: ['service@example.com'],
    subject: 'Customer follow-up for completed job',
    body: 'Can you confirm what was replaced during the visit?',
    receivedAt: '2026-07-06T13:00:00.000Z'
  });

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, thread, inbound }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
