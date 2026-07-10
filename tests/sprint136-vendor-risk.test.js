const fs = require('fs');

const required = [
  'apps/api/src/services/vendorRiskService.js',
  'apps/api/src/repositories/vendorRiskRepository.js',
  'apps/api/src/routes/vendorRisk.js',
  'scripts/seed-vendor-risk.js',
  'packages/database/postgres/136_vendor_risk.sql',
  'docs/sprint136-vendor-risk.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 136 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeVendorInput,
  normalizeServiceInput,
  normalizeAssessmentInput,
  normalizeAttestationInput,
  normalizeRemediationInput,
  normalizeReviewInput,
  riskRank,
  deriveVendorRisk,
  activateVendor,
  suspendVendor,
  submitAssessment,
  approveAssessment,
  requireRemediation,
  receiveAttestation,
  acceptAttestation,
  rejectAttestation,
  completeRemediation,
  waiveRemediation,
  completeReview,
  applyReviewToVendor,
  vendorRiskMetrics
} = require('../apps/api/src/services/vendorRiskService');

let vendor = normalizeVendorInput({ tenantId: 'tenant_demo', name: 'Acme Cloud', criticality: 'high' });
if (vendor.code !== 'ACME-CLOUD') process.exit(1);
vendor = activateVendor(vendor);
if (vendor.status !== 'active') process.exit(1);
if (suspendVendor(vendor).status !== 'suspended') process.exit(1);

const service = normalizeServiceInput({ vendorId: 'vendor1', name: 'Storage', processesPersonalData: true, dataCategories: ['financial'] });
if (deriveVendorRisk(vendor, [service]) !== 'critical') process.exit(1);
if (riskRank('critical') !== 4) process.exit(1);

let assessment = normalizeAssessmentInput({ vendorId: 'vendor1', inherentRisk: 'high' });
assessment = submitAssessment(assessment, 'security');
if (assessment.status !== 'in_review') process.exit(1);
if (approveAssessment(assessment).status !== 'approved') process.exit(1);
if (requireRemediation(assessment).status !== 'requires_remediation') process.exit(1);

let attestation = normalizeAttestationInput({ vendorId: 'vendor1' });
attestation = receiveAttestation(attestation, 's3://vendor/soc2.pdf');
attestation = acceptAttestation(attestation, 'security');
if (attestation.status !== 'accepted') process.exit(1);
const rejectedAttestation = rejectAttestation({ ...attestation, status: 'received' }, 'security', 'wrong doc');
if (rejectedAttestation.status !== 'rejected') process.exit(1);

let remediation = normalizeRemediationInput({ vendorId: 'vendor1', title: 'Fix MFA evidence' });
remediation = completeRemediation(remediation);
if (remediation.status !== 'completed') process.exit(1);
const waived = waiveRemediation({ ...remediation, status: 'open' }, 'accepted risk');
if (waived.status !== 'waived') process.exit(1);

let review = normalizeReviewInput({ vendorId: 'vendor1' });
review = completeReview(review, 'done', '2026-07-07T00:00:00.000Z');
vendor = applyReviewToVendor(vendor, review);
if (!vendor.nextReviewAt.startsWith('2027-07-07')) process.exit(1);

const metrics = vendorRiskMetrics({ vendors: [vendor], assessments: [assessment], attestations: [attestation], remediations: [remediation], reviews: [review] });
if (metrics.activeVendors !== 1 || metrics.acceptedAttestations !== 1) process.exit(1);

console.log('Sprint 136 vendor risk patch test passed.');
