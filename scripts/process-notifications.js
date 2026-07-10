const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';
  const limit = Number(process.env.NOTIFICATION_PROCESS_LIMIT || 25);
  const queued = await repos.notifications.pending(tenantId, limit);

  for (const notification of queued) {
    console.log(`[notification:${notification.channel}] ${notification.toAddress} ${notification.subject || ''}`);
    await repos.notifications.updateStatus(tenantId, notification.id, 'sent');
  }

  if (repos.store.close) await repos.store.close();
  console.log(`Processed ${queued.length} notification(s).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
