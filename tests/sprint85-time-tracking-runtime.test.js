const fs = require('fs');

const required = [
  'apps/api/src/services/timeTrackingService.js',
  'apps/api/src/repositories/timeEntryRepository.js',
  'apps/api/src/routes/timeTracking.js',
  'scripts/seed-time-tracking.js',
  'packages/database/postgres/085_time_tracking_runtime.sql',
  'docs/sprint85-time-tracking-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 85 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  minutesBetween,
  normalizeTimeEntryInput,
  clockOutEntry,
  approveEntry,
  summarizeLabor
} = require('../apps/api/src/services/timeTrackingService');

if (minutesBetween('2026-07-06T08:00:00.000Z', '2026-07-06T10:30:00.000Z') !== 150) {
  console.error('minutesBetween failed.');
  process.exit(1);
}

const entry = normalizeTimeEntryInput({
  technicianId: 'tech_demo_1',
  jobId: 'job_demo_1',
  startedAt: '2026-07-06T08:00:00.000Z',
  endedAt: '2026-07-06T10:00:00.000Z',
  hourlyRate: 40
});

if (entry.durationMinutes !== 120 || entry.laborCost !== 80) {
  console.error('Time entry normalization failed.');
  process.exit(1);
}

const open = normalizeTimeEntryInput({
  technicianId: 'tech_demo_1',
  startedAt: '2026-07-06T08:00:00.000Z',
  hourlyRate: 30
});
const clockedOut = clockOutEntry(open, '2026-07-06T09:30:00.000Z');
if (clockedOut.durationMinutes !== 90 || clockedOut.laborCost !== 45) {
  console.error('Clock-out helper failed.');
  process.exit(1);
}

const approved = approveEntry(clockedOut, 'manager_1', '2026-07-06T11:00:00.000Z');
if (approved.status !== 'approved') {
  console.error('Approve helper failed.');
  process.exit(1);
}

const summary = summarizeLabor([entry, clockedOut]);
if (summary.durationMinutes !== 210 || summary.laborCost !== 125) {
  console.error('Labor summary failed.');
  process.exit(1);
}

console.log('Sprint 85 time tracking runtime patch test passed.');
