const fs = require('fs');

const required = [
  'apps/api/src/services/communicationService.js',
  'apps/api/src/repositories/communicationRepository.js',
  'apps/api/src/routes/communications.js',
  'scripts/seed-communications.js',
  'packages/database/postgres/083_communications_runtime.sql',
  'docs/sprint83-communications-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 83 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeCommunicationInput,
  summarizeCommunication,
  communicationTimelineSort
} = require('../apps/api/src/services/communicationService');

const event = normalizeCommunicationInput({
  customerId: 'cust_demo_1',
  channel: 'sms',
  direction: 'outbound',
  body: 'Technician is on the way.'
});

if (event.status !== 'sent' || event.channel !== 'sms') {
  console.error('Communication normalization failed.');
  process.exit(1);
}

const summary = summarizeCommunication({ id: 'c1', ...event, body: 'x'.repeat(200) });
if (!summary.preview.endsWith('...') || summary.preview.length > 140) {
  console.error('Communication summary failed.');
  process.exit(1);
}

const sorted = communicationTimelineSort([
  { id: 'old', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'new', createdAt: '2026-02-01T00:00:00.000Z' }
]);
if (sorted[0].id !== 'new') {
  console.error('Timeline sort failed.');
  process.exit(1);
}

console.log('Sprint 83 communications runtime patch test passed.');
