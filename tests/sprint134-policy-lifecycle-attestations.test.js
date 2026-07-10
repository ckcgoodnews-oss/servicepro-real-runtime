const fs = require('fs');

const required = [
  'apps/api/src/services/policyLifecycleService.js',
  'apps/api/src/repositories/policyLifecycleRepository.js',
  'apps/api/src/routes/policyLifecycle.js',
  'scripts/seed-policy-lifecycle-attestations.js',
  'packages/database/postgres/134_policy_lifecycle_attestations.sql',
  'docs/sprint134-policy-lifecycle-attestations.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 134 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizePolicyInput,
  normalizeVersionInput,
  normalizeApprovalInput,
  normalizeAttestationInput,
  normalizeExceptionInput,
  normalizeReviewInput,
  submitVersion,
  approveVersion,
  rejectVersion,
  publishVersion,
  publishPolicy,
  approveGate,
  rejectGate,
  acknowledgeAttestation,
  markAttestationOverdue,
  waiveAttestation,
  approveException,
  rejectException,
  revokeException,
  completeReview,
  applyReviewToPolicy,
  policyMetrics
} = require('../apps/api/src/services/policyLifecycleService');

let policy = normalizePolicyInput({ tenantId: 'tenant_demo', title: 'Security Policy', policyType: 'security', reviewFrequencyDays: 365 });
if (policy.code !== 'SECURITY-POLICY') process.exit(1);

let version = normalizeVersionInput({ policyId: 'policy1', version: '1.0', body: 'body' });
version = submitVersion(version);
if (version.status !== 'in_review') process.exit(1);
if (approveVersion(version).status !== 'approved') process.exit(1);
if (rejectVersion(version).status !== 'rejected') process.exit(1);
version = { id: 'version1', ...publishVersion(version) };
policy = publishPolicy(policy, version, '2026-07-07T00:00:00.000Z');
if (policy.status !== 'active' || policy.currentVersionId !== 'version1') process.exit(1);

let approval = normalizeApprovalInput({ policyVersionId: 'version1', approverId: 'legal' });
approval = approveGate(approval, 'ok');
if (approval.status !== 'approved') process.exit(1);
const rejectedApproval = rejectGate({ ...approval, status: 'pending' }, 'no');
if (rejectedApproval.status !== 'rejected') process.exit(1);

let attestation = normalizeAttestationInput({
  policyId: 'policy1',
  policyVersionId: 'version1',
  subjectId: 'user1',
  assignedAt: '2026-07-01T00:00:00.000Z',
  dueAt: '2026-07-02T00:00:00.000Z'
});
attestation = markAttestationOverdue(attestation, '2026-07-03T00:00:00.000Z');
if (attestation.status !== 'overdue') process.exit(1);
attestation = acknowledgeAttestation({ ...attestation, status: 'assigned' });
if (attestation.status !== 'acknowledged') process.exit(1);
const waived = waiveAttestation({ ...attestation, status: 'assigned' }, 'contractor exemption');
if (waived.status !== 'waived') process.exit(1);

let exception = normalizeExceptionInput({ policyId: 'policy1', requesterId: 'manager', reason: 'legacy system' });
exception = approveException(exception, 'security');
if (exception.status !== 'approved') process.exit(1);
if (rejectException({ ...exception, status: 'requested' }, 'security').status !== 'rejected') process.exit(1);
if (revokeException(exception).status !== 'revoked') process.exit(1);

let review = normalizeReviewInput({ policyId: 'policy1' });
review = completeReview(review, 'done', '2026-07-07T00:00:00.000Z');
policy = applyReviewToPolicy(policy, review);
if (!policy.nextReviewAt.startsWith('2027-07-07')) process.exit(1);

const metrics = policyMetrics({
  policies: [policy],
  versions: [version],
  approvals: [approval],
  attestations: [attestation],
  exceptions: [exception],
  reviews: [review]
});
if (metrics.activePolicies !== 1 || metrics.acknowledgedAttestations !== 1 || metrics.activeExceptions !== 1) process.exit(1);

console.log('Sprint 134 policy lifecycle attestations patch test passed.');
