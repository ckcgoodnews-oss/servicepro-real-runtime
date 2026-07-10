const { validationError } = require('../errors/domainError');

const PROGRAM_STATUSES = ['planned', 'active', 'fieldwork', 'reporting', 'closed', 'cancelled'];
const CONTROL_STATUSES = ['draft', 'active', 'retired'];
const CONTROL_FREQUENCIES = ['continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'annual'];
const EVIDENCE_REQUEST_STATUSES = ['open', 'submitted', 'accepted', 'rejected', 'overdue', 'cancelled'];
const ARTIFACT_STATUSES = ['uploaded', 'accepted', 'rejected'];
const TEST_STATUSES = ['planned', 'in_progress', 'passed', 'failed', 'waived'];
const FINDING_STATUSES = ['open', 'in_progress', 'remediated', 'accepted_risk', 'closed'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const REMEDIATION_STATUSES = ['planned', 'in_progress', 'completed', 'blocked', 'cancelled'];
const ATTESTATION_STATUSES = ['draft', 'submitted', 'accepted', 'rejected'];

function assertAllowed(value, allowed, label) {
  if (!allowed.includes(value)) throw validationError(`Unsupported ${label}: ${value}`);
}
function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function addDays(dateText, days) {
  const base = new Date(dateText || new Date().toISOString());
  base.setUTCDate(base.getUTCDate() + Number(days || 0));
  return base.toISOString();
}
function normalizeProgramInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'planned';
  assertAllowed(status, PROGRAM_STATUSES, 'program status');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    framework: input.framework || 'SOC2',
    status,
    owner: input.owner || '',
    auditor: input.auditor || '',
    periodStart: input.periodStart || '',
    periodEnd: input.periodEnd || '',
    startedAt: input.startedAt || '',
    closedAt: input.closedAt || '',
    metadata: input.metadata || {}
  };
}
function normalizeControlInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.controlCode) throw validationError('controlCode is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'draft';
  const frequency = input.frequency || 'quarterly';
  assertAllowed(status, CONTROL_STATUSES, 'control status');
  assertAllowed(frequency, CONTROL_FREQUENCIES, 'control frequency');
  return {
    tenantId: input.tenantId,
    programId: input.programId || '',
    controlCode: input.controlCode,
    title: input.title,
    description: input.description || '',
    status,
    domain: input.domain || 'security',
    owner: input.owner || '',
    frequency,
    riskStatement: input.riskStatement || '',
    controlObjective: input.controlObjective || '',
    metadata: input.metadata || {}
  };
}
function normalizeEvidenceRequestInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.controlId) throw validationError('controlId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'open';
  assertAllowed(status, EVIDENCE_REQUEST_STATUSES, 'evidence request status');
  return {
    tenantId: input.tenantId,
    programId: input.programId || '',
    controlId: input.controlId,
    title: input.title,
    description: input.description || '',
    status,
    requestedBy: input.requestedBy || '',
    owner: input.owner || '',
    dueAt: input.dueAt || addDays(new Date().toISOString(), 14),
    submittedAt: input.submittedAt || '',
    acceptedAt: input.acceptedAt || '',
    rejectedAt: input.rejectedAt || '',
    rejectionReason: input.rejectionReason || '',
    metadata: input.metadata || {}
  };
}
function normalizeArtifactInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.requestId) throw validationError('requestId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'uploaded';
  assertAllowed(status, ARTIFACT_STATUSES, 'artifact status');
  return {
    tenantId: input.tenantId,
    requestId: input.requestId,
    controlId: input.controlId || '',
    title: input.title,
    description: input.description || '',
    status,
    fileUrl: input.fileUrl || '',
    hash: input.hash || '',
    uploadedBy: input.uploadedBy || '',
    uploadedAt: input.uploadedAt || new Date().toISOString(),
    reviewedBy: input.reviewedBy || '',
    reviewedAt: input.reviewedAt || '',
    rejectionReason: input.rejectionReason || '',
    metadata: input.metadata || {}
  };
}
function normalizeControlTestInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.controlId) throw validationError('controlId is required');
  const status = input.status || 'planned';
  assertAllowed(status, TEST_STATUSES, 'control test status');
  return {
    tenantId: input.tenantId,
    programId: input.programId || '',
    controlId: input.controlId,
    status,
    tester: input.tester || '',
    testProcedure: input.testProcedure || '',
    sampleSize: Number(input.sampleSize || 0),
    exceptionsFound: Number(input.exceptionsFound || 0),
    startedAt: input.startedAt || '',
    completedAt: input.completedAt || '',
    resultSummary: input.resultSummary || '',
    waiverReason: input.waiverReason || '',
    metadata: input.metadata || {}
  };
}
function normalizeFindingInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'open';
  const severity = input.severity || 'medium';
  assertAllowed(status, FINDING_STATUSES, 'finding status');
  assertAllowed(severity, SEVERITIES, 'finding severity');
  return {
    tenantId: input.tenantId,
    programId: input.programId || '',
    controlId: input.controlId || '',
    testId: input.testId || '',
    title: input.title,
    description: input.description || '',
    status,
    severity,
    owner: input.owner || '',
    openedAt: input.openedAt || new Date().toISOString(),
    dueAt: input.dueAt || addDays(new Date().toISOString(), 30),
    remediatedAt: input.remediatedAt || '',
    closedAt: input.closedAt || '',
    acceptedRiskReason: input.acceptedRiskReason || '',
    metadata: input.metadata || {}
  };
}
function normalizeRemediationInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.findingId) throw validationError('findingId is required');
  if (!input.summary) throw validationError('summary is required');
  const status = input.status || 'planned';
  assertAllowed(status, REMEDIATION_STATUSES, 'remediation status');
  return {
    tenantId: input.tenantId,
    findingId: input.findingId,
    summary: input.summary,
    description: input.description || '',
    status,
    owner: input.owner || '',
    targetDate: input.targetDate || addDays(new Date().toISOString(), 30),
    completedAt: input.completedAt || '',
    blockerReason: input.blockerReason || '',
    metadata: input.metadata || {}
  };
}
function normalizeAttestationInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.programId) throw validationError('programId is required');
  if (!input.attestor) throw validationError('attestor is required');
  const status = input.status || 'draft';
  assertAllowed(status, ATTESTATION_STATUSES, 'attestation status');
  return {
    tenantId: input.tenantId,
    programId: input.programId,
    attestor: input.attestor,
    title: input.title || 'Management Attestation',
    status,
    statement: input.statement || '',
    submittedAt: input.submittedAt || '',
    acceptedAt: input.acceptedAt || '',
    rejectedAt: input.rejectedAt || '',
    rejectionReason: input.rejectionReason || '',
    metadata: input.metadata || {}
  };
}
function activateProgram(program, at = new Date().toISOString()) {
  return { ...program, status: 'active', startedAt: program.startedAt || at, updatedAt: at };
}
function closeProgram(program, at = new Date().toISOString()) {
  return { ...program, status: 'closed', closedAt: at, updatedAt: at };
}
function activateControl(control, at = new Date().toISOString()) {
  return { ...control, status: 'active', updatedAt: at };
}
function retireControl(control, at = new Date().toISOString()) {
  return { ...control, status: 'retired', updatedAt: at };
}
function submitEvidenceRequest(request, at = new Date().toISOString()) {
  return { ...request, status: 'submitted', submittedAt: at, updatedAt: at };
}
function acceptEvidenceRequest(request, at = new Date().toISOString()) {
  return { ...request, status: 'accepted', acceptedAt: at, updatedAt: at };
}
function rejectEvidenceRequest(request, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...request, status: 'rejected', rejectionReason: reason, rejectedAt: at, updatedAt: at };
}
function acceptArtifact(artifact, reviewedBy, at = new Date().toISOString()) {
  if (!reviewedBy) throw validationError('reviewedBy is required');
  return { ...artifact, status: 'accepted', reviewedBy, reviewedAt: at, updatedAt: at };
}
function rejectArtifact(artifact, reviewedBy, reason, at = new Date().toISOString()) {
  if (!reviewedBy) throw validationError('reviewedBy is required');
  if (!reason) throw validationError('reason is required');
  return { ...artifact, status: 'rejected', reviewedBy, rejectionReason: reason, reviewedAt: at, updatedAt: at };
}
function startControlTest(test, tester = '', at = new Date().toISOString()) {
  return { ...test, status: 'in_progress', tester: tester || test.tester, startedAt: at, updatedAt: at };
}
function completeControlTest(test, exceptionsFound = 0, summary = '', at = new Date().toISOString()) {
  const exceptions = Number(exceptionsFound || 0);
  return { ...test, status: exceptions === 0 ? 'passed' : 'failed', exceptionsFound: exceptions, resultSummary: summary || test.resultSummary, completedAt: at, updatedAt: at };
}
function waiveControlTest(test, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...test, status: 'waived', waiverReason: reason, completedAt: at, updatedAt: at };
}
function remediateFinding(finding, at = new Date().toISOString()) {
  return { ...finding, status: 'remediated', remediatedAt: at, updatedAt: at };
}
function closeFinding(finding, at = new Date().toISOString()) {
  return { ...finding, status: 'closed', closedAt: at, updatedAt: at };
}
function acceptFindingRisk(finding, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...finding, status: 'accepted_risk', acceptedRiskReason: reason, updatedAt: at };
}
function startRemediation(plan, at = new Date().toISOString()) {
  return { ...plan, status: 'in_progress', updatedAt: at };
}
function completeRemediation(plan, at = new Date().toISOString()) {
  return { ...plan, status: 'completed', completedAt: at, updatedAt: at };
}
function submitAttestation(attestation, at = new Date().toISOString()) {
  return { ...attestation, status: 'submitted', submittedAt: at, updatedAt: at };
}
function acceptAttestation(attestation, at = new Date().toISOString()) {
  return { ...attestation, status: 'accepted', acceptedAt: at, updatedAt: at };
}
function rejectAttestation(attestation, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...attestation, status: 'rejected', rejectionReason: reason, rejectedAt: at, updatedAt: at };
}
function auditReady({ controls = [], requests = [], tests = [], findings = [], attestations = [] }) {
  const controlsReady = controls.every(x => ['active', 'retired'].includes(x.status));
  const evidenceReady = requests.every(x => ['accepted', 'cancelled'].includes(x.status));
  const testsReady = tests.every(x => ['passed', 'waived'].includes(x.status));
  const findingsReady = findings.every(x => ['remediated', 'accepted_risk', 'closed'].includes(x.status));
  const attestReady = attestations.some(x => x.status === 'accepted');
  return controlsReady && evidenceReady && testsReady && findingsReady && attestReady;
}
function complianceMetrics({ programs = [], controls = [], requests = [], artifacts = [], tests = [], findings = [], remediations = [], attestations = [] }) {
  return {
    activePrograms: programs.filter(x => ['active', 'fieldwork', 'reporting'].includes(x.status)).length,
    activeControls: controls.filter(x => x.status === 'active').length,
    openEvidenceRequests: requests.filter(x => ['open', 'submitted', 'overdue', 'rejected'].includes(x.status)).length,
    acceptedArtifacts: artifacts.filter(x => x.status === 'accepted').length,
    passedTests: tests.filter(x => x.status === 'passed').length,
    failedTests: tests.filter(x => x.status === 'failed').length,
    openFindings: findings.filter(x => ['open', 'in_progress'].includes(x.status)).length,
    criticalFindings: findings.filter(x => x.severity === 'critical' && ['open', 'in_progress'].includes(x.status)).length,
    completedRemediations: remediations.filter(x => x.status === 'completed').length,
    acceptedAttestations: attestations.filter(x => x.status === 'accepted').length
  };
}
module.exports = {
  PROGRAM_STATUSES, CONTROL_STATUSES, CONTROL_FREQUENCIES, EVIDENCE_REQUEST_STATUSES,
  ARTIFACT_STATUSES, TEST_STATUSES, FINDING_STATUSES, SEVERITIES, REMEDIATION_STATUSES,
  ATTESTATION_STATUSES, assertAllowed, slugCode, addDays, normalizeProgramInput,
  normalizeControlInput, normalizeEvidenceRequestInput, normalizeArtifactInput,
  normalizeControlTestInput, normalizeFindingInput, normalizeRemediationInput,
  normalizeAttestationInput, activateProgram, closeProgram, activateControl, retireControl,
  submitEvidenceRequest, acceptEvidenceRequest, rejectEvidenceRequest, acceptArtifact,
  rejectArtifact, startControlTest, completeControlTest, waiveControlTest,
  remediateFinding, closeFinding, acceptFindingRisk, startRemediation, completeRemediation,
  submitAttestation, acceptAttestation, rejectAttestation, auditReady, complianceMetrics
};
