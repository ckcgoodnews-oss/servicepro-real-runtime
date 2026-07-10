const fs = require('fs');

const required = [
  'apps/api/src/services/templateService.js',
  'apps/api/src/repositories/messageTemplateRepository.js',
  'apps/api/src/repositories/notificationRepository.js',
  'apps/api/src/routes/notifications.js',
  'scripts/process-notifications.js',
  'packages/database/postgres/064_notifications_runtime.sql'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 64 patch file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint64.json';
process.env.JWT_SECRET = 'test-secret-for-sprint-64';

const { resetRepositoriesForTest, getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const { renderTemplate, buildNotificationFromTemplate } = require('../apps/api/src/services/templateService');
const { permissionsForRoles, PERMISSIONS } = require('../apps/api/src/auth/permissions');

resetRepositoriesForTest();
const repos = getRepositories();
repos.store.reset();

const rendered = renderTemplate('Hello {{customer.name}}', { customer: { name: 'Maria' } });
if (rendered !== 'Hello Maria') {
  console.error('Template rendering failed.');
  process.exit(1);
}

const template = repos.messageTemplates.findByKey('tenant_demo', 'booking_requested');
if (!template) {
  console.error('Seed template missing.');
  process.exit(1);
}

const payload = buildNotificationFromTemplate(
  template,
  { toAddress: 'customer@example.com', toName: 'Maria Johnson' },
  { customerName: 'Maria', serviceType: 'Drain cleaning', requestedDate: '2026-07-10' }
);

const notification = repos.notifications.create('tenant_demo', payload);
if (!notification.id || !notification.body.includes('Drain cleaning')) {
  console.error('Notification queue create failed.');
  process.exit(1);
}

const sent = repos.notifications.updateStatus('tenant_demo', notification.id, 'sent');
if (sent.status !== 'sent' || !sent.sentAt) {
  console.error('Notification status update failed.');
  process.exit(1);
}

const ownerPermissions = permissionsForRoles(['owner']);
if (!ownerPermissions.includes(PERMISSIONS.NOTIFICATIONS_PROCESS)) {
  console.error('Owner missing notifications.process permission.');
  process.exit(1);
}

console.log('Sprint 64 notifications runtime patch test passed.');
