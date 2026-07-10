const fs = require('fs');

const required = [
  'apps/api/src/services/slaService.js',
  'apps/api/src/repositories/slaRepository.js',
  'apps/api/src/routes/sla.js',
  'scripts/seed-sla.js',
  'packages/database/postgres/089_sla_runtime.sql',
  'docs/sprint89-sla-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 89 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  addMinutesIso,
  normalizeSlaPolicyInput,
  buildTimerFromPolicy,
  evaluateSlaTimer,
  markResponded,
  markResolved,
  markBreached
} = require('../apps/api/src/services/slaService');

if (addMinutesIso('2026-07-06T08:00:00.000Z', 60) !== '2026-07-06T09:00:00.000Z') {
  console.error('SLA addMinutesIso failed.');
  process.exit(1);
}

const policy = { id: 'policy1', ...normalizeSlaPolicyInput({ name: 'Normal SLA', priority: 'normal', responseMinutes: 60, resolutionMinutes: 120 }) };
const timer = buildTimerFromPolicy(policy, { jobId: 'job1', customerId: 'cust1', startedAt: '2026-07-06T08:00:00.000Z' });

if (timer.responseDueAt !== '2026-07-06T09:00:00.000Z' || timer.resolutionDueAt !== '2026-07-06T10:00:00.000Z') {
  console.error('SLA timer build failed.');
  process.exit(1);
}

const early = evaluateSlaTimer(timer, '2026-07-06T08:30:00.000Z');
if (early.breached || early.responseMinutesRemaining !== 30) {
  console.error('SLA early evaluation failed.');
  process.exit(1);
}

const late = evaluateSlaTimer(timer, '2026-07-06T10:30:00.000Z');
if (!late.responseBreached || !late.resolutionBreached) {
  console.error('SLA breach evaluation failed.');
  process.exit(1);
}

const responded = markResponded(timer, '2026-07-06T08:45:00.000Z');
if (responded.status !== 'responded') {
  console.error('SLA responded marker failed.');
  process.exit(1);
}

const resolved = markResolved(responded, '2026-07-06T09:30:00.000Z');
if (resolved.status !== 'resolved') {
  console.error('SLA resolved marker failed.');
  process.exit(1);
}

const breached = markBreached(timer, 'Response SLA breached', '2026-07-06T09:30:00.000Z');
if (breached.status !== 'breached') {
  console.error('SLA breached marker failed.');
  process.exit(1);
}

console.log('Sprint 89 SLA runtime patch test passed.');
