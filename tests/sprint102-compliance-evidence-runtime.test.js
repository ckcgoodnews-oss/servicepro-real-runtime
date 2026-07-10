const fs = require('fs');

const required = [
  'apps/api/src/services/complianceEvidenceService.js',
  'apps/api/src/repositories/complianceEvidenceRepository.js',
  'apps/api/src/routes/complianceEvidence.js',
  'scripts/seed-compliance-evidence.js',
  'packages/database/postgres/102_compliance_evidence_runtime.sql',
  'docs/sprint102-compliance-evidence-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 102 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeFrameworkInput,
  normalizeControlInput,
  normalizeEvidencePackageInput,
  normalizeEvidenceItemInput,
  normalizeControlEvidenceMappingInput,
  normalizeAttestationInput,
  normalizeEvidenceExportInput,
  markEvidenceReviewed,
  approveAttestation,
  completeExport,
  calculateComplianceScore
} = require('../apps/api/src/services/complianceEvidenceService');

const framework = { id: 'fw1', ...normalizeFrameworkInput({ name: 'Internal Controls' }) };
if (framework.status !== 'active') {
  console.error('Framework normalization failed.');
  process.exit(1);
}

const control = { id: 'ctrl1', ...normalizeControlInput({ frameworkId: 'fw1', controlCode: 'SEC-001', title: 'MFA required' }) };
if (control.ownerTeam !== 'platform') {
  console.error('Control normalization failed.');
  process.exit(1);
}

const pkg = { id: 'pkg1', ...normalizeEvidencePackageInput({ name: 'Q3 Evidence' }) };
const item = { id: 'ev1', ...normalizeEvidenceItemInput({ packageId: 'pkg1', title: 'MFA policy export' }) };
const reviewed = markEvidenceReviewed(item, 'reviewer', true);
if (reviewed.status !== 'accepted') {
  console.error('Evidence review failed.');
  process.exit(1);
}

const mapping = normalizeControlEvidenceMappingInput({ controlId: 'ctrl1', evidenceItemId: 'ev1' });
if (mapping.relevance !== 'primary') {
  console.error('Mapping normalization failed.');
  process.exit(1);
}

const attestation = normalizeAttestationInput({ packageId: 'pkg1', attestedBy: 'owner' });
const approved = approveAttestation(attestation, 'approver');
if (approved.status !== 'approved') {
  console.error('Attestation approval failed.');
  process.exit(1);
}

const exp = normalizeEvidenceExportInput({ packageId: 'pkg1', requestedBy: 'owner' });
const completed = completeExport(exp, 's3://bucket/evidence.zip');
if (completed.status !== 'completed') {
  console.error('Export completion failed.');
  process.exit(1);
}

const score = calculateComplianceScore({
  controls: [control],
  mappings: [mapping],
  evidenceItems: [reviewed]
});
if (score.scorePercent !== 100 || score.status !== 'excellent') {
  console.error('Compliance score failed.');
  process.exit(1);
}

console.log('Sprint 102 compliance evidence runtime patch test passed.');
