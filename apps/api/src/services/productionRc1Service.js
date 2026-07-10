const { validationError } = require('../errors/domainError');

const CHECK_STATUSES = ['unknown', 'healthy', 'degraded', 'unhealthy'];
const READINESS_STATUSES = ['pending', 'ready', 'blocked', 'waived'];
const GATE_STATUSES = ['pending', 'passed', 'failed', 'waived'];
const DEPLOYMENT_STATUSES = ['planned', 'running', 'succeeded', 'failed', 'rolled_back', 'cancelled'];
const BACKUP_STATUSES = ['scheduled', 'running', 'verified', 'failed', 'expired'];
const RUNBOOK_STATUSES = ['draft', 'active', 'retired'];
const EVIDENCE_STATUSES = ['collected', 'verified', 'rejected'];

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
function normalizeHealthCheckInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'unknown';
  assertAllowed(status, CHECK_STATUSES, 'health check status');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    component: input.component || 'api',
    status,
    checkedAt: input.checkedAt || '',
    latencyMs: input.latencyMs == null ? null : Number(input.latencyMs),
    message: input.message || '',
    metadata: input.metadata || {}
  };
}
function normalizeReadinessCheckInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'pending';
  assertAllowed(status, READINESS_STATUSES, 'readiness status');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    owner: input.owner || '',
    status,
    required: input.required !== false,
    evidenceUrl: input.evidenceUrl || '',
    completedAt: input.completedAt || '',
    waiverReason: input.waiverReason || '',
    metadata: input.metadata || {}
  };
}
function normalizeReleaseGateInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'pending';
  assertAllowed(status, GATE_STATUSES, 'release gate status');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    category: input.category || 'quality',
    status,
    required: input.required !== false,
    evaluatedAt: input.evaluatedAt || '',
    evaluatedBy: input.evaluatedBy || '',
    resultSummary: input.resultSummary || '',
    waiverReason: input.waiverReason || '',
    metadata: input.metadata || {}
  };
}
function normalizeDeploymentAuditInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.releaseVersion) throw validationError('releaseVersion is required');
  const status = input.status || 'planned';
  assertAllowed(status, DEPLOYMENT_STATUSES, 'deployment status');
  return {
    tenantId: input.tenantId,
    releaseVersion: input.releaseVersion,
    environment: input.environment || 'production',
    status,
    requestedBy: input.requestedBy || '',
    approvedBy: input.approvedBy || '',
    startedAt: input.startedAt || '',
    completedAt: input.completedAt || '',
    commitSha: input.commitSha || '',
    artifactUrl: input.artifactUrl || '',
    rollbackVersion: input.rollbackVersion || '',
    notes: input.notes || '',
    metadata: input.metadata || {}
  };
}
function normalizeBackupVerificationInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.backupName) throw validationError('backupName is required');
  const status = input.status || 'scheduled';
  assertAllowed(status, BACKUP_STATUSES, 'backup status');
  return {
    tenantId: input.tenantId,
    backupName: input.backupName,
    backupType: input.backupType || 'database',
    status,
    storageLocation: input.storageLocation || '',
    startedAt: input.startedAt || '',
    completedAt: input.completedAt || '',
    verifiedAt: input.verifiedAt || '',
    verifiedBy: input.verifiedBy || '',
    restoreTested: input.restoreTested === true,
    retentionExpiresAt: input.retentionExpiresAt || addDays(new Date().toISOString(), 30),
    failureReason: input.failureReason || '',
    metadata: input.metadata || {}
  };
}
function normalizeRunbookInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'draft';
  assertAllowed(status, RUNBOOK_STATUSES, 'runbook status');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.title),
    title: input.title,
    category: input.category || 'operations',
    status,
    owner: input.owner || '',
    steps: Array.isArray(input.steps) ? input.steps : [],
    lastReviewedAt: input.lastReviewedAt || '',
    nextReviewAt: input.nextReviewAt || addDays(new Date().toISOString(), 180),
    metadata: input.metadata || {}
  };
}
function normalizeEvidenceInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'collected';
  assertAllowed(status, EVIDENCE_STATUSES, 'evidence status');
  return {
    tenantId: input.tenantId,
    title: input.title,
    evidenceType: input.evidenceType || 'release',
    status,
    fileUrl: input.fileUrl || '',
    collectedBy: input.collectedBy || '',
    collectedAt: input.collectedAt || new Date().toISOString(),
    verifiedBy: input.verifiedBy || '',
    verifiedAt: input.verifiedAt || '',
    rejectionReason: input.rejectionReason || '',
    metadata: input.metadata || {}
  };
}
function recordHealthResult(check, status, message = '', latencyMs = null, at = new Date().toISOString()) {
  assertAllowed(status, CHECK_STATUSES, 'health check status');
  return { ...check, status, message, latencyMs: latencyMs == null ? check.latencyMs : Number(latencyMs), checkedAt: at, updatedAt: at };
}
function markReady(check, evidenceUrl = '', at = new Date().toISOString()) {
  return { ...check, status: 'ready', evidenceUrl: evidenceUrl || check.evidenceUrl, completedAt: at, updatedAt: at };
}
function blockReadiness(check, reason = '', at = new Date().toISOString()) {
  return { ...check, status: 'blocked', waiverReason: reason || check.waiverReason, updatedAt: at };
}
function passGate(gate, evaluatedBy = '', summary = '', at = new Date().toISOString()) {
  return { ...gate, status: 'passed', evaluatedBy: evaluatedBy || gate.evaluatedBy, resultSummary: summary || gate.resultSummary, evaluatedAt: at, updatedAt: at };
}
function failGate(gate, evaluatedBy = '', summary = '', at = new Date().toISOString()) {
  return { ...gate, status: 'failed', evaluatedBy: evaluatedBy || gate.evaluatedBy, resultSummary: summary || gate.resultSummary, evaluatedAt: at, updatedAt: at };
}
function waiveGate(gate, reason, evaluatedBy = '', at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...gate, status: 'waived', waiverReason: reason, evaluatedBy: evaluatedBy || gate.evaluatedBy, evaluatedAt: at, updatedAt: at };
}
function startDeployment(deployment, at = new Date().toISOString()) {
  return { ...deployment, status: 'running', startedAt: at, updatedAt: at };
}
function completeDeployment(deployment, notes = '', at = new Date().toISOString()) {
  return { ...deployment, status: 'succeeded', notes: notes || deployment.notes, completedAt: at, updatedAt: at };
}
function failDeployment(deployment, notes = '', at = new Date().toISOString()) {
  return { ...deployment, status: 'failed', notes: notes || deployment.notes, completedAt: at, updatedAt: at };
}
function rollbackDeployment(deployment, rollbackVersion, notes = '', at = new Date().toISOString()) {
  if (!rollbackVersion) throw validationError('rollbackVersion is required');
  return { ...deployment, status: 'rolled_back', rollbackVersion, notes: notes || deployment.notes, completedAt: at, updatedAt: at };
}
function verifyBackup(backup, verifiedBy, restoreTested = false, at = new Date().toISOString()) {
  if (!verifiedBy) throw validationError('verifiedBy is required');
  return { ...backup, status: 'verified', verifiedBy, restoreTested, verifiedAt: at, completedAt: backup.completedAt || at, updatedAt: at };
}
function failBackup(backup, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...backup, status: 'failed', failureReason: reason, completedAt: at, updatedAt: at };
}
function activateRunbook(runbook, at = new Date().toISOString()) {
  return { ...runbook, status: 'active', lastReviewedAt: at, nextReviewAt: addDays(at, 180), updatedAt: at };
}
function verifyEvidence(evidence, verifiedBy, at = new Date().toISOString()) {
  if (!verifiedBy) throw validationError('verifiedBy is required');
  return { ...evidence, status: 'verified', verifiedBy, verifiedAt: at, updatedAt: at };
}
function rejectEvidence(evidence, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...evidence, status: 'rejected', rejectionReason: reason, updatedAt: at };
}
function releaseReady({ readiness = [], gates = [], health = [], backups = [] }) {
  const requiredReady = readiness.filter(x => x.required !== false).every(x => ['ready', 'waived'].includes(x.status));
  const requiredGates = gates.filter(x => x.required !== false).every(x => ['passed', 'waived'].includes(x.status));
  const healthOk = health.every(x => ['healthy', 'degraded'].includes(x.status));
  const backupOk = backups.some(x => x.status === 'verified' && x.restoreTested === true);
  return requiredReady && requiredGates && healthOk && backupOk;
}
function productionMetrics({ health = [], readiness = [], gates = [], deployments = [], backups = [], runbooks = [], evidence = [] }) {
  return {
    healthyChecks: health.filter(x => x.status === 'healthy').length,
    degradedChecks: health.filter(x => x.status === 'degraded').length,
    readyChecks: readiness.filter(x => x.status === 'ready').length,
    blockedChecks: readiness.filter(x => x.status === 'blocked').length,
    passedGates: gates.filter(x => x.status === 'passed').length,
    failedGates: gates.filter(x => x.status === 'failed').length,
    successfulDeployments: deployments.filter(x => x.status === 'succeeded').length,
    rolledBackDeployments: deployments.filter(x => x.status === 'rolled_back').length,
    verifiedBackups: backups.filter(x => x.status === 'verified').length,
    activeRunbooks: runbooks.filter(x => x.status === 'active').length,
    verifiedEvidence: evidence.filter(x => x.status === 'verified').length
  };
}
module.exports = {
  CHECK_STATUSES, READINESS_STATUSES, GATE_STATUSES, DEPLOYMENT_STATUSES, BACKUP_STATUSES,
  RUNBOOK_STATUSES, EVIDENCE_STATUSES, assertAllowed, slugCode, addDays,
  normalizeHealthCheckInput, normalizeReadinessCheckInput, normalizeReleaseGateInput,
  normalizeDeploymentAuditInput, normalizeBackupVerificationInput, normalizeRunbookInput,
  normalizeEvidenceInput, recordHealthResult, markReady, blockReadiness, passGate, failGate,
  waiveGate, startDeployment, completeDeployment, failDeployment, rollbackDeployment,
  verifyBackup, failBackup, activateRunbook, verifyEvidence, rejectEvidence, releaseReady,
  productionMetrics
};
