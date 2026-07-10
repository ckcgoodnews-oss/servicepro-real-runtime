const fs = require('fs');

const required = [
  'apps/api/src/services/dataResidencyService.js',
  'apps/api/src/repositories/dataResidencyRepository.js',
  'apps/api/src/routes/dataResidency.js',
  'scripts/seed-data-residency.js',
  'packages/database/postgres/126_data_residency.sql',
  'docs/sprint126-data-residency.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 126 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizePolicyInput,
  normalizeRegionAssignmentInput,
  normalizeTransferReviewInput,
  normalizeRequirementInput,
  normalizeViolationInput,
  normalizeApprovalInput,
  isRegionAllowed,
  evaluateTransfer,
  approveTransfer,
  rejectTransfer,
  completeTransfer,
  approveReviewApproval,
  rejectReviewApproval,
  satisfyRequirement,
  remediateViolation,
  closeViolation,
  residencyMetrics
} = require('../apps/api/src/services/dataResidencyService');

const policy = normalizePolicyInput({ tenantId: 'tenant_demo', name: 'US Only', allowedRegions: ['us-east-2'], restrictedRegions: ['eu-central-1'] });
if (!isRegionAllowed(policy, 'us-east-2')) process.exit(1);
if (isRegionAllowed(policy, 'eu-central-1')) process.exit(1);

const assignment = normalizeRegionAssignmentInput({ tenantId: 'tenant_demo', customerId: 'cust1', regionCode: 'us-east-2' });
if (assignment.status !== 'active') process.exit(1);

let transfer = normalizeTransferReviewInput({ tenantId: 'tenant_demo', customerId: 'cust1', sourceRegion: 'us-east-2', targetRegion: 'eu-central-1' });
const evaluation = evaluateTransfer(policy, transfer);
if (evaluation.allowed) process.exit(1);

transfer = approveTransfer(transfer, 'privacy');
if (transfer.status !== 'approved') process.exit(1);
transfer = completeTransfer(transfer);
if (transfer.status !== 'completed') process.exit(1);
const rejected = rejectTransfer({ ...transfer, status: 'requested' }, 'privacy', 'No');
if (rejected.status !== 'rejected') process.exit(1);

let requirement = normalizeRequirementInput({ tenantId: 'tenant_demo', regionCode: 'us-east-2', title: 'Local storage' });
requirement = satisfyRequirement(requirement);
if (requirement.status !== 'satisfied') process.exit(1);

let violation = normalizeViolationInput({ tenantId: 'tenant_demo', customerId: 'cust1', title: 'Region drift' });
violation = remediateViolation(violation);
violation = closeViolation(violation);
if (violation.status !== 'closed') process.exit(1);

let approval = normalizeApprovalInput({ transferReviewId: 'tr1', approverId: 'privacy' });
approval = approveReviewApproval(approval, 'ok');
if (approval.status !== 'approved') process.exit(1);
const rejectedApproval = rejectReviewApproval({ ...approval, status: 'pending' }, 'no');
if (rejectedApproval.status !== 'rejected') process.exit(1);

const metrics = residencyMetrics({ policies: [policy], assignments: [assignment], transfers: [transfer], requirements: [requirement], violations: [violation] });
if (metrics.activePolicies !== 1 || metrics.activeAssignments !== 1) process.exit(1);

console.log('Sprint 126 data residency patch test passed.');
