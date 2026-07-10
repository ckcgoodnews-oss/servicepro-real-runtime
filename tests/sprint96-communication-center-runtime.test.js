const fs = require('fs');

const required = [
  'apps/api/src/services/communicationCenterService.js',
  'apps/api/src/repositories/communicationCenterRepository.js',
  'apps/api/src/routes/communicationCenter.js',
  'scripts/seed-communication-center.js',
  'packages/database/postgres/096_communication_center_runtime.sql',
  'docs/sprint96-communication-center-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 96 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeThreadInput,
  normalizeMessageInput,
  applyMessageToThread,
  assignThread,
  markThreadRead,
  resolveThread,
  summarizeThreads
} = require('../apps/api/src/services/communicationCenterService');

let thread = normalizeThreadInput({
  subject: 'Question about invoice',
  channel: 'email',
  customerId: 'cust1'
});

if (thread.status !== 'open' || thread.channel !== 'email') {
  console.error('Thread normalization failed.');
  process.exit(1);
}

const inbound = normalizeMessageInput({
  threadId: 'thread1',
  channel: 'email',
  direction: 'inbound',
  body: 'I have a question.',
  receivedAt: '2026-07-06T12:00:00.000Z'
});

thread = applyMessageToThread(thread, inbound, '2026-07-06T12:00:00.000Z');
if (thread.unreadCount !== 1 || thread.needsResponse !== true) {
  console.error('Inbound message thread update failed.');
  process.exit(1);
}

const outbound = normalizeMessageInput({
  threadId: 'thread1',
  channel: 'email',
  direction: 'outbound',
  body: 'We can help.',
  sentAt: '2026-07-06T12:05:00.000Z'
});

thread = applyMessageToThread(thread, outbound, '2026-07-06T12:05:00.000Z');
if (thread.needsResponse !== false || thread.status !== 'pending_customer') {
  console.error('Outbound message thread update failed.');
  process.exit(1);
}

thread = assignThread(thread, 'dispatcher1');
if (thread.assignedTo !== 'dispatcher1') {
  console.error('Thread assignment failed.');
  process.exit(1);
}

thread = markThreadRead({ ...thread, unreadCount: 2, needsResponse: true });
if (thread.unreadCount !== 0 || thread.needsResponse !== false) {
  console.error('Mark read failed.');
  process.exit(1);
}

thread = resolveThread(thread);
if (thread.status !== 'resolved') {
  console.error('Resolve thread failed.');
  process.exit(1);
}

const summary = summarizeThreads([
  { status: 'open', unreadCount: 1, needsResponse: true, priority: 'urgent' },
  { status: 'pending_customer', unreadCount: 0, needsResponse: false, priority: 'normal' }
]);
if (summary.threadCount !== 2 || summary.unreadCount !== 1 || summary.urgentCount !== 1) {
  console.error('Thread summary failed.');
  process.exit(1);
}

console.log('Sprint 96 communication center runtime patch test passed.');
