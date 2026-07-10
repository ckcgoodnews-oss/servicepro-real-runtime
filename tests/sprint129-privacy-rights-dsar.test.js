const fs = require('fs');

const required = [
  'apps/api/src/services/privacyRightsService.js',
  'apps/api/src/repositories/privacyRightsRepository.js',
  'apps/api/src/routes/privacyRights.js',
  'scripts/seed-privacy-rights-dsar.js',
  'packages/database/postgres/129_privacy_rights_dsar.sql',
  'docs/sprint129-privacy-rights-dsar.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 129 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizePrivacyRequestInput,
  normalizeIdentityVerificationInput,
  normalizeSearchTaskInput,
  normalizeResponsePackageInput,
  normalizeApprovalInput,
  normalizeFulfillmentInput,
  startVerification,
  verifyIdentity,
  failIdentity,
  startSearchTask,
  completeSearchTask,
  failSearchTask,
  markPackageReady,
  approvePackage,
  approveRequest,
  rejectRequest,
  approveReview,
  rejectReview,
  sendFulfillment,
  failFulfillment,
  markFulfilled,
  isOverdue,
  privacyMetrics
} = require('../apps/api/src/services/privacyRightsService');

let request = normalizePrivacyRequestInput({ tenantId: 'tenant_demo', requestType: 'access', subjectEmail: 's@example.com', submittedAt: '2026-07-07T00:00:00.000Z' });
if (!request.dueAt.startsWith('2026-08-06')) process.exit(1);
request = startVerification(request);
if (request.status !== 'verifying_identity') process.exit(1);

let verification = normalizeIdentityVerificationInput({ requestId: 'req1' });
verification = verifyIdentity(verification);
if (verification.status !== 'verified') process.exit(1);
const failedVerification = failIdentity(normalizeIdentityVerificationInput({ requestId: 'req1' }));
if (failedVerification.status !== 'failed') process.exit(1);

let task = normalizeSearchTaskInput({ requestId: 'req1', sourceSystem: 'crm' });
task = startSearchTask(task);
task = completeSearchTask(task, 3, 's3://out');
if (task.status !== 'completed' || task.recordsFound !== 3) process.exit(1);
const failedTask = failSearchTask(normalizeSearchTaskInput({ requestId: 'req1', sourceSystem: 'crm' }), 'bad');
if (failedTask.status !== 'failed') process.exit(1);

let pkg = normalizeResponsePackageInput({ requestId: 'req1' });
pkg = markPackageReady(pkg, 's3://pkg.zip', 'privacy');
pkg = approvePackage(pkg);
if (pkg.status !== 'approved') process.exit(1);

request = approveRequest(request);
if (request.status !== 'approved') process.exit(1);
const rejectedRequest = rejectRequest({ ...request, status: 'submitted' }, 'duplicate');
if (rejectedRequest.status !== 'rejected') process.exit(1);

let approval = normalizeApprovalInput({ requestId: 'req1', approverId: 'privacy' });
approval = approveReview(approval, 'ok');
if (approval.status !== 'approved') process.exit(1);
const rejectedApproval = rejectReview({ ...approval, status: 'pending' }, 'no');
if (rejectedApproval.status !== 'rejected') process.exit(1);

let fulfillment = normalizeFulfillmentInput({ requestId: 'req1', recipientEmail: 's@example.com' });
fulfillment = sendFulfillment(fulfillment);
if (fulfillment.status !== 'sent') process.exit(1);
const failedFulfillment = failFulfillment(normalizeFulfillmentInput({ requestId: 'req1' }), 'smtp');
if (failedFulfillment.status !== 'failed') process.exit(1);

request = markFulfilled(request);
if (request.status !== 'fulfilled') process.exit(1);
if (isOverdue(request, '2026-09-01T00:00:00.000Z')) process.exit(1);

const metrics = privacyMetrics({ requests: [request], verifications: [verification], tasks: [task], packages: [pkg], approvals: [approval], fulfillments: [fulfillment] });
if (metrics.totalRequests !== 1 || metrics.sentFulfillments !== 1) process.exit(1);

console.log('Sprint 129 privacy rights DSAR patch test passed.');
