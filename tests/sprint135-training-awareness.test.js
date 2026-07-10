const fs = require('fs');

const required = [
  'apps/api/src/services/trainingAwarenessService.js',
  'apps/api/src/repositories/trainingAwarenessRepository.js',
  'apps/api/src/routes/trainingAwareness.js',
  'scripts/seed-training-awareness.js',
  'packages/database/postgres/135_training_awareness.sql',
  'docs/sprint135-training-awareness.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 135 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeCourseInput,
  normalizeCampaignInput,
  normalizeAssignmentInput,
  normalizeEvidenceInput,
  normalizeReminderInput,
  normalizeExceptionInput,
  scheduleCampaign,
  activateCampaign,
  completeCampaign,
  startAssignment,
  completeAssignment,
  markAssignmentOverdue,
  waiveAssignment,
  evidencePassesCourse,
  sendReminder,
  failReminder,
  approveException,
  rejectException,
  revokeException,
  nextRenewalDate,
  trainingMetrics
} = require('../apps/api/src/services/trainingAwarenessService');

const course = normalizeCourseInput({ tenantId: 'tenant_demo', title: 'Security Basics', passingScore: 80, renewalDays: 365 });
if (course.code !== 'SECURITY-BASICS') process.exit(1);

let campaign = normalizeCampaignInput({ tenantId: 'tenant_demo', courseId: 'course1', name: 'Annual Security' });
campaign = scheduleCampaign(campaign, '2026-07-07T00:00:00.000Z', '2026-07-21T00:00:00.000Z');
campaign = activateCampaign(campaign);
if (campaign.status !== 'active') process.exit(1);
if (completeCampaign(campaign).status !== 'completed') process.exit(1);

let assignment = normalizeAssignmentInput({
  tenantId: 'tenant_demo',
  courseId: 'course1',
  subjectId: 'user1',
  assignedAt: '2026-07-01T00:00:00.000Z',
  dueAt: '2026-07-02T00:00:00.000Z'
});
assignment = startAssignment(assignment, '2026-07-01T01:00:00.000Z');
assignment = markAssignmentOverdue(assignment, '2026-07-03T00:00:00.000Z');
if (assignment.status !== 'overdue') process.exit(1);
assignment = completeAssignment(assignment, 90, '2026-07-04T00:00:00.000Z');
if (assignment.status !== 'completed' || assignment.score !== 90) process.exit(1);
if (!nextRenewalDate(assignment, course).startsWith('2027-07-04')) process.exit(1);

const evidence = normalizeEvidenceInput({ assignmentId: 'assign1', score: 90, passed: false });
if (!evidencePassesCourse(evidence, course)) process.exit(1);

const waived = waiveAssignment({ ...assignment, status: 'assigned' }, 'approved exception');
if (waived.status !== 'waived') process.exit(1);

let reminder = normalizeReminderInput({ assignmentId: 'assign1' });
reminder = sendReminder(reminder);
if (reminder.status !== 'sent') process.exit(1);
if (failReminder(normalizeReminderInput({ assignmentId: 'assign1' }), 'smtp').status !== 'failed') process.exit(1);

let exception = normalizeExceptionInput({ assignmentId: 'assign1', requesterId: 'manager', reason: 'leave' });
exception = approveException(exception, 'security');
if (exception.status !== 'approved') process.exit(1);
if (rejectException({ ...exception, status: 'requested' }, 'security').status !== 'rejected') process.exit(1);
if (revokeException(exception).status !== 'revoked') process.exit(1);

const metrics = trainingMetrics({
  courses: [course],
  campaigns: [campaign],
  assignments: [assignment, waived],
  reminders: [reminder],
  exceptions: [exception]
});
if (metrics.activeCourses !== 1 || metrics.completedCount !== 1 || metrics.remindersSent !== 1 || metrics.approvedExceptions !== 1) process.exit(1);

console.log('Sprint 135 training awareness patch test passed.');
