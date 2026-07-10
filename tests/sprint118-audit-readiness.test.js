const fs = require('fs');

const required = [
  'apps/api/src/services/auditReadinessService.js',
  'apps/api/src/repositories/auditReadinessRepository.js',
  'apps/api/src/routes/auditReadiness.js',
  'scripts/seed-audit-readiness.js',
  'packages/database/postgres/118_audit_readiness.sql',
  'docs/sprint118-audit-readiness.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 118 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeEngagementInput,
  normalizeAuditorRequestInput,
  normalizeEvidencePackageInput,
  normalizeWalkthroughInput,
  normalizeSampleRequestInput,
  normalizeAuditIssueInput,
  transitionEngagement,
  submitRequest,
  acceptRequest,
  rejectRequest,
  markPackageReady,
  submitPackage,
  completeWalkthrough,
  collectSample,
  submitSample,
  addManagementResponse,
  closeIssue,
  auditReadinessMetrics
} = require('../apps/api/src/services/auditReadinessService');

let engagement = normalizeEngagementInput({ name: 'SOC 2 Audit', startAt: '2026-07-07T00:00:00.000Z' });
if (engagement.code !== 'SOC-2-AUDIT') process.exit(1);
engagement = transitionEngagement(engagement, 'completed');
if (engagement.status !== 'completed' || !engagement.completedAt) process.exit(1);

let request = normalizeAuditorRequestInput({ engagementId: 'eng1', title: 'Access evidence' });
request = submitRequest(request);
if (request.status !== 'submitted') process.exit(1);
request = acceptRequest(request);
if (request.status !== 'accepted') process.exit(1);
const rejected = rejectRequest({ ...request, status: 'submitted' }, 'Missing file');
if (rejected.status !== 'rejected' || rejected.rejectionReason !== 'Missing file') process.exit(1);

let pkg = normalizeEvidencePackageInput({ requestId: 'req1', title: 'Package' });
pkg = markPackageReady(pkg, 'compliance');
if (pkg.status !== 'ready') process.exit(1);
pkg = submitPackage(pkg);
if (pkg.status !== 'submitted') process.exit(1);

let walkthrough = normalizeWalkthroughInput({ engagementId: 'eng1', title: 'Walkthrough' });
walkthrough = completeWalkthrough(walkthrough, 'done');
if (walkthrough.status !== 'completed') process.exit(1);

let sample = normalizeSampleRequestInput({ engagementId: 'eng1', controlId: 'ctrl1', sampleSize: 2 });
sample = collectSample(sample, [{ id: 1 }, { id: 2 }]);
if (sample.status !== 'collected' || sample.sampleItems.length !== 2) process.exit(1);
sample = submitSample(sample);
if (sample.status !== 'submitted') process.exit(1);

let issue = normalizeAuditIssueInput({ engagementId: 'eng1', title: 'Issue', severity: 'high' });
issue = addManagementResponse(issue, 'We will fix it.');
if (issue.status !== 'management_response') process.exit(1);
issue = closeIssue(issue);
if (issue.status !== 'closed') process.exit(1);

const metrics = auditReadinessMetrics({ engagements: [engagement], requests: [request], issues: [issue] });
if (metrics.engagements !== 1 || metrics.openIssues !== 0) process.exit(1);

console.log('Sprint 118 audit readiness patch test passed.');
