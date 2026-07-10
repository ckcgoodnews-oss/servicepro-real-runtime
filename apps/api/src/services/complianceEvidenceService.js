const { validationError } = require('../errors/domainError');

const FRAMEWORK_STATUSES = ['draft', 'active', 'retired'];
const CONTROL_STATUSES = ['active', 'inactive', 'deprecated'];
const EVIDENCE_STATUSES = ['draft', 'collected', 'reviewed', 'accepted', 'rejected', 'expired'];
const ATTESTATION_STATUSES = ['draft', 'submitted', 'approved', 'rejected'];
const EXPORT_STATUSES = ['queued', 'processing', 'completed', 'failed'];

function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizeFrameworkInput(input = {}) {
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'active';
  if (!FRAMEWORK_STATUSES.includes(status)) throw validationError(`Unsupported framework status: ${status}`);
  return {
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    version: input.version || '',
    status,
    metadata: input.metadata || {}
  };
}

function normalizeControlInput(input = {}) {
  if (!input.frameworkId) throw validationError('frameworkId is required');
  if (!input.controlCode) throw validationError('controlCode is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'active';
  if (!CONTROL_STATUSES.includes(status)) throw validationError(`Unsupported control status: ${status}`);
  return {
    frameworkId: input.frameworkId,
    controlCode: input.controlCode,
    title: input.title,
    description: input.description || '',
    ownerTeam: input.ownerTeam || 'platform',
    frequency: input.frequency || 'quarterly',
    status,
    metadata: input.metadata || {}
  };
}

function normalizeEvidencePackageInput(input = {}) {
  if (!input.name) throw validationError('name is required');
  return {
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    periodStart: input.periodStart || '',
    periodEnd: input.periodEnd || '',
    ownerTeam: input.ownerTeam || 'platform',
    locked: input.locked === true,
    lockedAt: input.lockedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeEvidenceItemInput(input = {}) {
  if (!input.packageId) throw validationError('packageId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'collected';
  if (!EVIDENCE_STATUSES.includes(status)) throw validationError(`Unsupported evidence status: ${status}`);
  return {
    packageId: input.packageId,
    title: input.title,
    description: input.description || '',
    evidenceType: input.evidenceType || 'document',
    sourceSystem: input.sourceSystem || '',
    artifactUri: input.artifactUri || '',
    collectedBy: input.collectedBy || '',
    collectedAt: input.collectedAt || new Date().toISOString(),
    reviewedBy: input.reviewedBy || '',
    reviewedAt: input.reviewedAt || '',
    expiresAt: input.expiresAt || '',
    status,
    hash: input.hash || '',
    metadata: input.metadata || {}
  };
}

function normalizeControlEvidenceMappingInput(input = {}) {
  if (!input.controlId) throw validationError('controlId is required');
  if (!input.evidenceItemId) throw validationError('evidenceItemId is required');
  return {
    controlId: input.controlId,
    evidenceItemId: input.evidenceItemId,
    relevance: input.relevance || 'primary',
    notes: input.notes || '',
    metadata: input.metadata || {}
  };
}

function normalizeAttestationInput(input = {}) {
  if (!input.packageId) throw validationError('packageId is required');
  if (!input.attestedBy) throw validationError('attestedBy is required');
  const status = input.status || 'submitted';
  if (!ATTESTATION_STATUSES.includes(status)) throw validationError(`Unsupported attestation status: ${status}`);
  return {
    packageId: input.packageId,
    attestedBy: input.attestedBy,
    attestedAt: input.attestedAt || new Date().toISOString(),
    statement: input.statement || '',
    status,
    approvedBy: input.approvedBy || '',
    approvedAt: input.approvedAt || '',
    rejectedReason: input.rejectedReason || '',
    metadata: input.metadata || {}
  };
}

function normalizeEvidenceExportInput(input = {}) {
  if (!input.packageId) throw validationError('packageId is required');
  const status = input.status || 'queued';
  if (!EXPORT_STATUSES.includes(status)) throw validationError(`Unsupported export status: ${status}`);
  return {
    packageId: input.packageId,
    exportFormat: input.exportFormat || 'zip',
    status,
    requestedBy: input.requestedBy || '',
    requestedAt: input.requestedAt || new Date().toISOString(),
    completedAt: input.completedAt || '',
    artifactUri: input.artifactUri || '',
    failureReason: input.failureReason || '',
    metadata: input.metadata || {}
  };
}

function markEvidenceReviewed(item, reviewedBy, accepted = true, reviewedAt = new Date().toISOString()) {
  if (!reviewedBy) throw validationError('reviewedBy is required');
  return {
    ...item,
    reviewedBy,
    reviewedAt,
    status: accepted ? 'accepted' : 'rejected',
    updatedAt: reviewedAt
  };
}

function approveAttestation(attestation, approvedBy, approvedAt = new Date().toISOString()) {
  if (!approvedBy) throw validationError('approvedBy is required');
  return {
    ...attestation,
    status: 'approved',
    approvedBy,
    approvedAt,
    updatedAt: approvedAt
  };
}

function completeExport(record, artifactUri, completedAt = new Date().toISOString()) {
  if (!artifactUri) throw validationError('artifactUri is required');
  return {
    ...record,
    status: 'completed',
    artifactUri,
    completedAt,
    updatedAt: completedAt
  };
}

function calculateComplianceScore({ controls = [], mappings = [], evidenceItems = [] }) {
  const activeControls = controls.filter(x => x.status !== 'inactive' && x.status !== 'deprecated');
  const evidenceById = new Map(evidenceItems.map(x => [x.id, x]));
  const coveredControls = activeControls.filter(control => {
    return mappings.some(mapping => {
      if (mapping.controlId !== control.id) return false;
      const evidence = evidenceById.get(mapping.evidenceItemId);
      return evidence && ['reviewed', 'accepted'].includes(evidence.status);
    });
  });

  const total = activeControls.length;
  const covered = coveredControls.length;
  const score = total ? Math.round((covered / total) * 10000) / 100 : 0;

  return {
    totalControls: total,
    coveredControls: covered,
    missingControls: total - covered,
    scorePercent: score,
    status: score >= 95 ? 'excellent' : score >= 80 ? 'good' : score >= 60 ? 'needs_attention' : 'at_risk'
  };
}

module.exports = {
  FRAMEWORK_STATUSES,
  CONTROL_STATUSES,
  EVIDENCE_STATUSES,
  ATTESTATION_STATUSES,
  EXPORT_STATUSES,
  slugCode,
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
};
