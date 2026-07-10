const fs = require('fs');

const required = [
  'apps/api/src/services/reminderService.js',
  'apps/api/src/repositories/reminderRepository.js',
  'apps/api/src/routes/reminders.js',
  'scripts/seed-reminders.js',
  'packages/database/postgres/084_reminders_runtime.sql',
  'docs/sprint84-reminders-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 84 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  addDays,
  normalizeReminderRuleInput,
  normalizeFollowUpInput,
  isDue,
  isOverdue,
  completeFollowUp,
  snoozeFollowUp,
  followUpSummary
} = require('../apps/api/src/services/reminderService');

if (addDays('2026-07-06', 3) !== '2026-07-09') {
  console.error('addDays failed.');
  process.exit(1);
}

const rule = normalizeReminderRuleInput({ name: 'Invoice follow-up', triggerType: 'invoice.sent', offsetDays: 3 });
if (rule.defaultPriority !== 'normal') {
  console.error('Reminder rule normalization failed.');
  process.exit(1);
}

const followUp = normalizeFollowUpInput({
  customerId: 'cust_demo_1',
  title: 'Call customer',
  dueDate: '2026-07-05'
});

if (!isDue(followUp, '2026-07-06') || !isOverdue(followUp, '2026-07-06')) {
  console.error('Due/overdue calculation failed.');
  process.exit(1);
}

const completed = completeFollowUp(followUp, '2026-07-06T12:00:00.000Z');
if (completed.status !== 'completed') {
  console.error('Complete follow-up failed.');
  process.exit(1);
}

const snoozed = snoozeFollowUp(followUp, '2026-07-10');
if (isDue(snoozed, '2026-07-06')) {
  console.error('Snooze logic failed.');
  process.exit(1);
}

const summary = followUpSummary(followUp, '2026-07-06');
if (!summary.overdue) {
  console.error('Follow-up summary failed.');
  process.exit(1);
}

console.log('Sprint 84 reminders runtime patch test passed.');
