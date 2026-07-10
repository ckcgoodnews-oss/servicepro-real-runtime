const fs = require('fs');

const required = [
  'apps/api/src/services/privacyService.js',
  'apps/api/src/repositories/privacyRepository.js',
  'apps/api/src/routes/privacy.js',
  'scripts/seed-privacy-automation.js',
  'packages/database/postgres/113_privacy_automation.sql',
  'docs/sprint113-privacy-automation.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 113 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizePrivacyRequestInput,
  normalizeConsentRecordInput,
  normalizePrivacyExportJobInput,
  normalizeRedactionTaskInput,
  normalizeErasureApprovalInput,
  normalizePrivacyAuditInput,
  addDays,
  verifyIdentity,
  startPrivacyExport,
  completePrivacyExport,
  failPrivacyExport,
  completeRedactionTask,
  failRedactionTask,
  approveErasure,
  rejectErasure,
  completePrivacyRequest,
  rejectPrivacyRequest,
  withdrawConsent,
  isOverdue
} = require('../apps/api/src/services/privacyService');

let request = normalizePrivacyRequestInput({ tenantId: 'tenant_demo', subjectEmail: 'person@example.com', requestType: 'export', submittedAt: '2026-07-07T00:00:00.000Z' });
if (request.dueAt !== '2026-08-06T00:00:00.000Z') process.exit(1);
if (addDays('2026-07-07T00:00:00.000Z', 1) !== '2026-07-08T00:00:00.000Z') process.exit(1);

request = verifyIdentity(request);
if (request.status !== 'in_progress' || !request.identityVerifiedAt) process.exit(1);
if (!isOverdue({ ...request, dueAt: '2026-01-01T00:00:00.000Z' }, '2026-02-01T00:00:00.000Z')) process.exit(1);

let consent = normalizeConsentRecordInput({ tenantId: 'tenant_demo', subjectEmail: 'person@example.com', purpose: 'service' });
consent = withdrawConsent(consent);
if (consent.status !== 'withdrawn') process.exit(1);

let job = normalizePrivacyExportJobInput({ requestId: 'req1' });
job = startPrivacyExport(job);
if (job.status !== 'running') process.exit(1);
job = completePrivacyExport(job, 's3://privacy/export.zip');
if (job.status !== 'completed') process.exit(1);
const failedJob = failPrivacyExport(normalizePrivacyExportJobInput({ requestId: 'req1' }), 'boom');
if (failedJob.status !== 'failed') process.exit(1);

let task = normalizeRedactionTaskInput({ requestId: 'req1', targetType: 'profile', targetId: 'person1', fields: ['phone'] });
task = completeRedactionTask(task, 'privacy');
if (task.status !== 'completed') process.exit(1);
const failedTask = failRedactionTask(normalizeRedactionTaskInput({ requestId: 'req1', targetType: 'profile', targetId: 'person1' }), 'bad');
if (failedTask.status !== 'failed') process.exit(1);

let approval = normalizeErasureApprovalInput({ requestId: 'req1', approverId: 'legal' });
approval = approveErasure(approval, 'ok');
if (approval.status !== 'approved') process.exit(1);
approval = rejectErasure({ ...approval, status: 'pending' }, 'no');
if (approval.status !== 'rejected') process.exit(1);

request = completePrivacyRequest(request);
if (request.status !== 'completed') process.exit(1);
const rejected = rejectPrivacyRequest({ ...request, status: 'in_progress' }, 'Not valid');
if (rejected.status !== 'rejected' || rejected.rejectionReason !== 'Not valid') process.exit(1);

const audit = normalizePrivacyAuditInput({ requestId: 'req1', eventType: 'completed' });
if (audit.eventType !== 'completed') process.exit(1);

console.log('Sprint 113 privacy automation patch test passed.');
