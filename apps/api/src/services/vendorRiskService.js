const { validationError } = require('../errors/domainError');

const VENDOR_STATUSES = ['prospect', 'active', 'suspended', 'terminated', 'archived'];
const CRITICALITY_LEVELS = ['low', 'medium', 'high', 'critical'];
const SERVICE_STATUSES = ['planned', 'active', 'deprecated', 'retired'];
const ASSESSMENT_STATUSES = ['draft', 'in_review', 'approved', 'requires_remediation', 'rejected', 'expired'];
const RISK_LEVELS = ['low', 'medium', 'high', 'critical'];
const ATTESTATION_STATUSES = ['requested', 'received', 'accepted', 'rejected', 'expired'];
const REMEDIATION_STATUSES = ['open', 'in_progress', 'completed', 'waived', 'cancelled'];
const REVIEW_STATUSES = ['scheduled', 'in_progress', 'completed', 'overdue', 'cancelled'];

function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function assertAllowed(value, allowed, label) {
  if (!allowed.includes(value)) throw validationError(`Unsupported ${label}: ${value}`);
}

function addDays(dateText, days) {
  const base = new Date(dateText || new Date().toISOString());
  if (Number.isNaN(base.getTime())) return '';
  base.setUTCDate(base.getUTCDate() + Number(days || 0));
  return base.toISOString();
}

function normalizeVendorInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'prospect';
  const criticality = input.criticality || 'medium';
  assertAllowed(status, VENDOR_STATUSES, 'vendor status');
  assertAllowed(criticality, CRITICALITY_LEVELS, 'vendor criticality');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    status,
    criticality,
    owner: input.owner || '',
    businessUnit: input.businessUnit || '',
    contactName: input.contactName || '',
    contactEmail: input.contactEmail || '',
    website: input.website || '',
    dataAccess: Array.isArray(input.dataAccess) ? input.dataAccess : [],
    regions: Array.isArray(input.regions) ? input.regions : [],
    lastReviewedAt: input.lastReviewedAt || '',
    nextReviewAt: input.nextReviewAt || addDays(new Date().toISOString(), 365),
    metadata: input.metadata || {}
  };
}

function normalizeServiceInput(input = {}) {
  if (!input.vendorId) throw validationError('vendorId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'planned';
  assertAllowed(status, SERVICE_STATUSES, 'vendor service status');
  return {
    vendorId: input.vendorId,
    tenantId: input.tenantId || '',
    name: input.name,
    description: input.description || '',
    status,
    serviceType: input.serviceType || 'other',
    processesPersonalData: input.processesPersonalData === true,
    dataCategories: Array.isArray(input.dataCategories) ? input.dataCategories : [],
    integrationType: input.integrationType || '',
    region: input.region || '',
    metadata: input.metadata || {}
  };
}

function normalizeAssessmentInput(input = {}) {
  if (!input.vendorId) throw validationError('vendorId is required');
  const status = input.status || 'draft';
  const inherentRisk = input.inherentRisk || 'medium';
  const residualRisk = input.residualRisk || inherentRisk;
  assertAllowed(status, ASSESSMENT_STATUSES, 'vendor assessment status');
  assertAllowed(inherentRisk, RISK_LEVELS, 'inherent risk');
  assertAllowed(residualRisk, RISK_LEVELS, 'residual risk');
  return {
    vendorId: input.vendorId,
    tenantId: input.tenantId || '',
    status,
    assessor: input.assessor || '',
    startedAt: input.startedAt || new Date().toISOString(),
    completedAt: input.completedAt || '',
    inherentRisk,
    residualRisk,
    score: input.score === undefined || input.score === null ? null : Number(input.score),
    summary: input.summary || '',
    securityNotes: input.securityNotes || '',
    privacyNotes: input.privacyNotes || '',
    businessContinuityNotes: input.businessContinuityNotes || '',
    metadata: input.metadata || {}
  };
}

function normalizeAttestationInput(input = {}) {
  if (!input.vendorId) throw validationError('vendorId is required');
  const status = input.status || 'requested';
  assertAllowed(status, ATTESTATION_STATUSES, 'vendor attestation status');
  return {
    vendorId: input.vendorId,
    assessmentId: input.assessmentId || '',
    tenantId: input.tenantId || '',
    status,
    requestedAt: input.requestedAt || new Date().toISOString(),
    receivedAt: input.receivedAt || '',
    documentType: input.documentType || 'security_questionnaire',
    documentUrl: input.documentUrl || '',
    reviewedBy: input.reviewedBy || '',
    reviewedAt: input.reviewedAt || '',
    rejectionReason: input.rejectionReason || '',
    metadata: input.metadata || {}
  };
}

function normalizeRemediationInput(input = {}) {
  if (!input.vendorId) throw validationError('vendorId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'open';
  assertAllowed(status, REMEDIATION_STATUSES, 'remediation status');
  return {
    vendorId: input.vendorId,
    assessmentId: input.assessmentId || '',
    tenantId: input.tenantId || '',
    title: input.title,
    description: input.description || '',
    status,
    owner: input.owner || '',
    dueAt: input.dueAt || '',
    completedAt: input.completedAt || '',
    waiverReason: input.waiverReason || '',
    metadata: input.metadata || {}
  };
}

function normalizeReviewInput(input = {}) {
  if (!input.vendorId) throw validationError('vendorId is required');
  const status = input.status || 'scheduled';
  assertAllowed(status, REVIEW_STATUSES, 'vendor review status');
  return {
    vendorId: input.vendorId,
    tenantId: input.tenantId || '',
    status,
    reviewerId: input.reviewerId || '',
    reviewerName: input.reviewerName || '',
    scheduledAt: input.scheduledAt || new Date().toISOString(),
    completedAt: input.completedAt || '',
    notes: input.notes || '',
    metadata: input.metadata || {}
  };
}

function riskRank(level) {
  return { low: 1, medium: 2, high: 3, critical: 4 }[level] || 0;
}

function deriveVendorRisk(vendor, services = []) {
  const personal = services.some(x => x.processesPersonalData);
  const sensitive = services.some(x => (x.dataCategories || []).some(c => ['credentials', 'financial', 'health', 'government_id', 'children', 'special_category'].includes(c)));
  if (vendor.criticality === 'critical' || sensitive) return 'critical';
  if (vendor.criticality === 'high' || personal) return 'high';
  if (vendor.criticality === 'medium') return 'medium';
  return 'low';
}

function activateVendor(vendor, at = new Date().toISOString()) {
  return { ...vendor, status: 'active', updatedAt: at };
}

function suspendVendor(vendor, at = new Date().toISOString()) {
  return { ...vendor, status: 'suspended', updatedAt: at };
}

function submitAssessment(assessment, assessor, at = new Date().toISOString()) {
  if (!assessor) throw validationError('assessor is required');
  return { ...assessment, status: 'in_review', assessor, updatedAt: at };
}

function approveAssessment(assessment, at = new Date().toISOString()) {
  return { ...assessment, status: 'approved', completedAt: at, updatedAt: at };
}

function requireRemediation(assessment, at = new Date().toISOString()) {
  return { ...assessment, status: 'requires_remediation', updatedAt: at };
}

function receiveAttestation(attestation, documentUrl, at = new Date().toISOString()) {
  if (!documentUrl) throw validationError('documentUrl is required');
  return { ...attestation, status: 'received', documentUrl, receivedAt: at, updatedAt: at };
}

function acceptAttestation(attestation, reviewedBy, at = new Date().toISOString()) {
  if (!reviewedBy) throw validationError('reviewedBy is required');
  return { ...attestation, status: 'accepted', reviewedBy, reviewedAt: at, updatedAt: at };
}

function rejectAttestation(attestation, reviewedBy, reason = '', at = new Date().toISOString()) {
  if (!reviewedBy) throw validationError('reviewedBy is required');
  return { ...attestation, status: 'rejected', reviewedBy, reviewedAt: at, rejectionReason: reason || 'Rejected', updatedAt: at };
}

function completeRemediation(item, at = new Date().toISOString()) {
  return { ...item, status: 'completed', completedAt: at, updatedAt: at };
}

function waiveRemediation(item, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...item, status: 'waived', waiverReason: reason, updatedAt: at };
}

function completeReview(review, notes = '', at = new Date().toISOString()) {
  return { ...review, status: 'completed', notes: notes || review.notes, completedAt: at, updatedAt: at };
}

function applyReviewToVendor(vendor, review, at = new Date().toISOString()) {
  return { ...vendor, lastReviewedAt: review.completedAt || at, nextReviewAt: addDays(review.completedAt || at, 365), updatedAt: at };
}

function vendorRiskMetrics({ vendors = [], assessments = [], attestations = [], remediations = [], reviews = [] }) {
  return {
    activeVendors: vendors.filter(x => x.status === 'active').length,
    criticalVendors: vendors.filter(x => x.criticality === 'critical').length,
    openAssessments: assessments.filter(x => ['draft', 'in_review', 'requires_remediation'].includes(x.status)).length,
    acceptedAttestations: attestations.filter(x => x.status === 'accepted').length,
    openRemediations: remediations.filter(x => ['open', 'in_progress'].includes(x.status)).length,
    overdueReviews: reviews.filter(x => x.status === 'overdue').length
  };
}

module.exports = {
  VENDOR_STATUSES,
  CRITICALITY_LEVELS,
  SERVICE_STATUSES,
  ASSESSMENT_STATUSES,
  RISK_LEVELS,
  ATTESTATION_STATUSES,
  REMEDIATION_STATUSES,
  REVIEW_STATUSES,
  slugCode,
  addDays,
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
};
