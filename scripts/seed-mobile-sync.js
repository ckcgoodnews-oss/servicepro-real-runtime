const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const device = await repos.mobileSync.registerDevice(tenantId, {
    userId: 'user_demo_tech',
    technicianId: 'tech_demo_1',
    deviceName: 'Demo Technician Tablet',
    devicePlatform: 'ios',
    appVersion: '1.0.0'
  });

  const pushed = await repos.mobileSync.pushChanges(tenantId, {
    deviceId: device.id,
    changes: [
      {
        clientChangeId: 'client-change-1',
        entityType: 'job',
        entityId: 'job_demo_1',
        operation: 'update',
        baseVersion: 1,
        clientVersion: 2,
        payload: { status: 'in_progress' }
      }
    ],
    serverRecords: {
      'job:job_demo_1': { id: 'job_demo_1', version: 1, status: 'scheduled' }
    }
  });

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, tenantId, device, pushed }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
