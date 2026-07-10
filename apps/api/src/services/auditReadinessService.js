const { validationError } = require('../errors/domainError');

const ENGAGEMENT_STATUSES = ['planned', 'active', 'fieldwork', 'management_response', 'completed', 'cancelled'];
const REQUEST_STATUSES = ['open', 'in_progress', 'submitted', 'accepted', 'rejected', 'cancelled'];
const PACKAGE_STATUSES = ['draft', 'ready', 'submitted', 'accepted', 'rejected'];
const WALKTHROUGH_STATUSES = ['scheduled', 'completed', 'cancelled'];
const SAMPLE_STATUSES = ['requested', 'collected', 'submitted', 'accepted', 'rejected'];
const ISSUE_STATUSES = ['open', 'management_response', 'remediated', 'accepted_risk', 'closed'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];

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

function normalizeEngagementInput(input = {}) {
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'planned';
  assertAllowed(status, ENGAGEMENT_STATUSES, 'engagement status');
  const startAt = input.startAt || new Date().toISOString();
  return {
    code: input.code || slugCode(input.name),
    name: input.name,
    status,
    auditFirm: input.auditFirm || '',
    auditorLead: input.auditorLead || '',
    internalOwner: input.internalOwner || '',
    frameworkId: input.frameworkId || '',
    periodStart: input.periodStart || '',
    periodEnd: input.periodEnd || '',
    startAt,
    dueAt: input.dueAt || addDays(startAt, 90),
    completedAt: input.completedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeAuditorRequestInput(input = {}) {
  if (!input.engagementId) throw validationError('engagementId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'open';
  assertAllowed(status, REQUEST_STATUSES, 'auditor request status');
  return {
    engagementId: input.engagementId,
    controlId: input.controlId || '',
    title: input.title,
    description: input.description || '',
    status,
    owner: input.owner || '',
    requestedBy: input.requestedBy || '',
    requestedAt: input.requestedAt || new Date().toISOString(),
    dueAt: input.dueAt || '',
    submittedAt: input.submittedAt || '',
    acceptedAt: input.acceptedAt || '',
    rejectionReason: input.rejectionReason || '',
    metadata: input.metadata || {}
  };
}

function normalizeEvidencePackageInput(input = {}) {
  if (!input.requestId) throw validationError('requestId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'draft';
  assertAllowed(status, PACKAGE_STATUSES, 'evidence package status');
  return {
    requestId: input.requestId,
    title: input.title,
    status,
    preparedBy: input.preparedBy || '',
    preparedAt: input.preparedAt || '',
    submittedAt: input.submittedAt || '',
    artifacts: Array.isArray(input.artifacts) ? input.artifacts : [],
    notes: input.notes || '',
    metadata: input.metadata || {}
  };
}

function normalizeWalkthroughInput(input = {}) {
  if (!input.engagementId) throw validationError('engagementId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'scheduled';
  assertAllowed(status, WALKTHROUGH_STATUSES, 'walkthrough status');
  return {
    engagementId: input.engagementId,
    controlId: input.controlId || '',
    title: input.title,
    status,
    scheduledAt: input.scheduledAt || new Date().toISOString(),
    completedAt: input.completedAt || '',
    attendees: Array.isArray(input.attendees) ? input.attendees : [],
    notes: input.notes || '',
    recordingUrl: input.recordingUrl || '',
    metadata: input.metadata || {}
  };
}

function normalizeSampleRequestInput(input = {}) {
  if (!input.engagementId) throw validationError('engagementId is required');
  if (!input.controlId) throw validationError('controlId is required');
  const status = input.status || 'requested';
  assertAllowed(status, SAMPLE_STATUSES, 'sample request status');
  return {
    engagementId: input.engagementId,
    controlId: input.controlId,
    populationName: input.populationName || '',
    sampleSize: Number(input.sampleSize || 0),
    status,
    requestedAt: input.requestedAt || new Date().toISOString(),
    collectedAt: input.collectedAt || '',
    submittedAt: input.submittedAt || '',
    sampleItems: Array.isArray(input.sampleItems) ? input.sampleItems : [],
    metadata: input.metadata || {}
  };
}

function normalizeAuditIssueInput(input = {}) {
  if (!input.engagementId) throw validationError('engagementId is required');
  if (!input.title) throw validationError('title is required');
  const severity = input.severity || 'medium';
  const status = input.status || 'open';
  assertAllowed(severity, SEVERITIES, 'audit issue severity');
  assertAllowed(status, ISSUE_STATUSES, 'audit issue status');
  return {
    engagementId: input.engagementId,
    controlId: input.controlId || '',
    title: input.title,
    description: input.description || '',
    severity,
    status,
    owner: input.owner || '',
    managementResponse: input.managementResponse || '',
    dueAt: input.dueAt || '',
    closedAt: input.closedAt || '',
    metadata: input.metadata || {}
  };
}

function transitionEngagement(engagement, status, at = new Date().toISOString()) {
  assertAllowed(status, ENGAGEMENT_STATUSES, 'engagement status');
  const next = { ...engagement, status, updatedAt: at };
  if (status === 'completed' && !next.completedAt) next.completedAt = at;
  return next;
}

function submitRequest(request, at = new Date().toISOString()) {
  return { ...request, status: 'submitted', submittedAt: at, updatedAt: at };
}

function acceptRequest(request, at = new Date().toISOString()) {
  return { ...request, status: 'accepted', acceptedAt: at, updatedAt: at };
}

function rejectRequest(request, reason, at = new Date().toISOString()) {
  return { ...request, status: 'rejected', rejectionReason: reason || 'Rejected by auditor', updatedAt: at };
}

function markPackageReady(pkg, preparedBy, at = new Date().toISOString()) {
  if (!preparedBy) throw validationError('preparedBy is required');
  return { ...pkg, status: 'ready', preparedBy, preparedAt: at, updatedAt: at };
}

function submitPackage(pkg, at = new Date().toISOString()) {
  return { ...pkg, status: 'submitted', submittedAt: at, updatedAt: at };
}

function completeWalkthrough(walkthrough, notes = '', at = new Date().toISOString()) {
  return { ...walkthrough, status: 'completed', notes: notes || walkthrough.notes, completedAt: at, updatedAt: at };
}

function collectSample(sampleRequest, sampleItems = [], at = new Date().toISOString()) {
  return { ...sampleRequest, status: 'collected', sampleItems, collectedAt: at, updatedAt: at };
}

function submitSample(sampleRequest, at = new Date().toISOString()) {
  return { ...sampleRequest, status: 'submitted', submittedAt: at, updatedAt: at };
}

function addManagementResponse(issue, response, at = new Date().toISOString()) {
  if (!response) throw validationError('response is required');
  return { ...issue, status: 'management_response', managementResponse: response, updatedAt: at };
}

function closeIssue(issue, at = new Date().toISOString()) {
  return { ...issue, status: 'closed', closedAt: at, updatedAt: at };
}

function auditReadinessMetrics({ engagements = [], requests = [], issues = [] }) {
  return {
    engagements: engagements.length,
    activeEngagements: engagements.filter(x => ['active', 'fieldwork', 'management_response'].includes(x.status)).length,
    openRequests: requests.filter(x => ['open', 'in_progress'].includes(x.status)).length,
    submittedRequests: requests.filter(x => x.status === 'submitted').length,
    openIssues: issues.filter(x => !['closed', 'accepted_risk'].includes(x.status)).length,
    highIssues: issues.filter(x => ['high', 'critical'].includes(x.severity) && x.status !== 'closed').length
  };
}

module.exports = {
  ENGAGEMENT_STATUSES,
  REQUEST_STATUSES,
  PACKAGE_STATUSES,
  WALKTHROUGH_STATUSES,
  SAMPLE_STATUSES,
  ISSUE_STATUSES,
  SEVERITIES,
  slugCode,
  addDays,
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
};
