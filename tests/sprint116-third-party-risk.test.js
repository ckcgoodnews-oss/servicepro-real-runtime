const fs = require('fs');

const required = [
  'apps/api/src/services/thirdPartyRiskService.js',
  'apps/api/src/repositories/thirdPartyRiskRepository.js',
  'apps/api/src/routes/thirdPartyRisk.js',
  'scripts/seed-third-party-risk.js',
  'packages/database/postgres/116_third_party_risk.sql',
  'docs/sprint116-third-party-risk.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 116 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeVendorInput,
  normalizeAssessmentInput,
  normalizeQuestionnaireResponseInput,
  normalizeFindingInput,
  normalizeRemediationTaskInput,
  normalizeExceptionInput,
  criticalityScore,
  severityScore,
  calculateVendorRisk,
  completeAssessment,
  transitionFinding,
  completeRemediation,
  approveException,
  rejectException,
  isExceptionActive,
  vendorMetrics
} = require('../apps/api/src/services/thirdPartyRiskService');

const vendor = normalizeVendorInput({ tenantId: 'tenant_demo', name: 'Cloud Vendor', criticality: 'critical' });
if (vendor.vendorCode !== 'CLOUD-VENDOR') process.exit(1);
if (criticalityScore('critical') !== 90) process.exit(1);
if (severityScore('high') !== 75) process.exit(1);

const assessment = normalizeAssessmentInput({ vendorId: 'vendor1', startedAt: '2026-07-07T00:00:00.000Z' });
if (!assessment.dueAt.startsWith('2026-08-06')) process.exit(1);

const response = normalizeQuestionnaireResponseInput({ assessmentId: 'assessment1', questionKey: 'mfa', answer: 'partial', riskPoints: 20 });
const finding = normalizeFindingInput({ vendorId: 'vendor1', title: 'MFA gap', severity: 'high' });
const risk = calculateVendorRisk(vendor, [finding], [response]);
if (risk.level !== 'high' && risk.level !== 'critical') process.exit(1);

const completedAssessment = completeAssessment(assessment, [response], [finding], vendor);
if (completedAssessment.status !== 'completed' || completedAssessment.score <= 0) process.exit(1);

let closedFinding = transitionFinding(finding, 'closed');
if (closedFinding.status !== 'closed' || !closedFinding.closedAt) process.exit(1);

let task = normalizeRemediationTaskInput({ findingId: 'finding1', title: 'Enable MFA' });
task = completeRemediation(task);
if (task.status !== 'completed') process.exit(1);

let exceptionRecord = normalizeExceptionInput({ findingId: 'finding1', reason: 'Temporary', expiresAt: '2026-12-31T00:00:00.000Z' });
exceptionRecord = approveException(exceptionRecord, 'security');
if (!isExceptionActive(exceptionRecord, '2026-08-01T00:00:00.000Z')) process.exit(1);
exceptionRecord = rejectException({ ...exceptionRecord, status: 'pending' }, 'security');
if (exceptionRecord.status !== 'rejected') process.exit(1);

const metrics = vendorMetrics([vendor], [{ severity: 'critical', status: 'open' }]);
if (metrics.totalVendors !== 1 || metrics.activeVendors !== 1 || metrics.criticalVendors !== 1 || metrics.criticalFindings !== 1) process.exit(1);

console.log('Sprint 116 third-party risk patch test passed.');
