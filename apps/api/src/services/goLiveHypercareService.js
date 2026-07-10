const { validationError } = require('../errors/domainError');

const CHECKLIST_STATUSES = ['pending', 'in_progress', 'completed', 'blocked', 'waived'];
const CUTOVER_STATUSES = ['draft', 'approved', 'running', 'completed', 'failed', 'rolled_back', 'cancelled'];
const STEP_STATUSES = ['pending', 'running', 'completed', 'failed', 'skipped'];
const DNS_STATUSES = ['planned', 'validated', 'propagating', 'completed', 'failed', 'rolled_back'];
const COMM_STATUSES = ['draft', 'approved', 'sent', 'cancelled'];
const ROLLBACK_STATUSES = ['not_required', 'watching', 'recommended', 'approved', 'executed', 'declined'];
const ISSUE_STATUSES = ['open', 'in_progress', 'resolved', 'closed', 'accepted_risk'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const REPORT_STATUSES = ['draft', 'published'];

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

function normalizeChecklistInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'pending';
  const severity = input.severity || 'medium';
  assertAllowed(status, CHECKLIST_STATUSES, 'checklist status');
  assertAllowed(severity, SEVERITIES, 'checklist severity');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.title),
    title: input.title,
    description: input.description || '',
    category: input.category || 'launch',
    status,
    severity,
    owner: input.owner || '',
    dueAt: input.dueAt || '',
    completedAt: input.completedAt || '',
    evidenceUrl: input.evidenceUrl || '',
    waiverReason: input.waiverReason || '',
    metadata: input.metadata || {}
  };
}

function normalizeCutoverPlanInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'draft';
  assertAllowed(status, CUTOVER_STATUSES, 'cutover status');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    status,
    environment: input.environment || 'production',
    releaseVersion: input.releaseVersion || '',
    owner: input.owner || '',
    scheduledStartAt: input.scheduledStartAt || '',
    scheduledEndAt: input.scheduledEndAt || '',
    startedAt: input.startedAt || '',
    completedAt: input.completedAt || '',
    approvedBy: input.approvedBy || '',
    approvedAt: input.approvedAt || '',
    rollbackPlanUrl: input.rollbackPlanUrl || '',
    metadata: input.metadata || {}
  };
}

function normalizeCutoverStepInput(input = {}) {
  if (!input.cutoverPlanId) throw validationError('cutoverPlanId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'pending';
  assertAllowed(status, STEP_STATUSES, 'cutover step status');
  return {
    tenantId: input.tenantId || '',
    cutoverPlanId: input.cutoverPlanId,
    title: input.title,
    description: input.description || '',
    sequence: Number(input.sequence || 1),
    status,
    owner: input.owner || '',
    startedAt: input.startedAt || '',
    completedAt: input.completedAt || '',
    failureReason: input.failureReason || '',
    metadata: input.metadata || {}
  };
}

function normalizeDnsCutoverInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.domain) throw validationError('domain is required');
  const status = input.status || 'planned';
  assertAllowed(status, DNS_STATUSES, 'DNS cutover status');
  return {
    tenantId: input.tenantId,
    cutoverPlanId: input.cutoverPlanId || '',
    domain: input.domain,
    recordType: input.recordType || 'CNAME',
    previousValue: input.previousValue || '',
    targetValue: input.targetValue || '',
    ttlSeconds: Number(input.ttlSeconds || 300),
    status,
    validatedAt: input.validatedAt || '',
    propagationStartedAt: input.propagationStartedAt || '',
    completedAt: input.completedAt || '',
    failureReason: input.failureReason || '',
    metadata: input.metadata || {}
  };
}

function normalizeLaunchCommunicationInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.audience) throw validationError('audience is required');
  const status = input.status || 'draft';
  assertAllowed(status, COMM_STATUSES, 'communication status');
  return {
    tenantId: input.tenantId,
    cutoverPlanId: input.cutoverPlanId || '',
    audience: input.audience,
    channel: input.channel || 'email',
    subject: input.subject || '',
    body: input.body || '',
    status,
    approvedBy: input.approvedBy || '',
    approvedAt: input.approvedAt || '',
    sentAt: input.sentAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeRollbackDecisionInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.cutoverPlanId) throw validationError('cutoverPlanId is required');
  const status = input.status || 'not_required';
  assertAllowed(status, ROLLBACK_STATUSES, 'rollback status');
  return {
    tenantId: input.tenantId,
    cutoverPlanId: input.cutoverPlanId,
    status,
    reason: input.reason || '',
    decidedBy: input.decidedBy || '',
    decidedAt: input.decidedAt || '',
    executedAt: input.executedAt || '',
    impactSummary: input.impactSummary || '',
    metadata: input.metadata || {}
  };
}

function normalizeHypercareIssueInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'open';
  const severity = input.severity || 'medium';
  assertAllowed(status, ISSUE_STATUSES, 'hypercare issue status');
  assertAllowed(severity, SEVERITIES, 'hypercare issue severity');
  return {
    tenantId: input.tenantId,
    title: input.title,
    description: input.description || '',
    status,
    severity,
    owner: input.owner || '',
    source: input.source || '',
    openedAt: input.openedAt || new Date().toISOString(),
    resolvedAt: input.resolvedAt || '',
    closedAt: input.closedAt || '',
    workaround: input.workaround || '',
    resolution: input.resolution || '',
    metadata: input.metadata || {}
  };
}

function normalizeDailyReportInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  const status = input.status || 'draft';
  assertAllowed(status, REPORT_STATUSES, 'daily report status');
  return {
    tenantId: input.tenantId,
    reportDate: input.reportDate || new Date().toISOString().slice(0, 10),
    status,
    summary: input.summary || '',
    openIssueCount: Number(input.openIssueCount || 0),
    criticalIssueCount: Number(input.criticalIssueCount || 0),
    resolvedIssueCount: Number(input.resolvedIssueCount || 0),
    publishedAt: input.publishedAt || '',
    publishedBy: input.publishedBy || '',
    metadata: input.metadata || {}
  };
}

function completeChecklist(item, evidenceUrl = '', at = new Date().toISOString()) {
  return { ...item, status: 'completed', evidenceUrl: evidenceUrl || item.evidenceUrl, completedAt: at, updatedAt: at };
}
function waiveChecklist(item, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...item, status: 'waived', waiverReason: reason, updatedAt: at };
}
function approveCutover(plan, approvedBy, at = new Date().toISOString()) {
  if (!approvedBy) throw validationError('approvedBy is required');
  return { ...plan, status: 'approved', approvedBy, approvedAt: at, updatedAt: at };
}
function startCutover(plan, at = new Date().toISOString()) {
  return { ...plan, status: 'running', startedAt: at, updatedAt: at };
}
function completeCutover(plan, at = new Date().toISOString()) {
  return { ...plan, status: 'completed', completedAt: at, updatedAt: at };
}
function failCutover(plan, reason = '', at = new Date().toISOString()) {
  return { ...plan, status: 'failed', failureReason: reason, completedAt: at, updatedAt: at };
}
function rollbackCutover(plan, at = new Date().toISOString()) {
  return { ...plan, status: 'rolled_back', completedAt: at, updatedAt: at };
}
function startStep(step, at = new Date().toISOString()) {
  return { ...step, status: 'running', startedAt: at, updatedAt: at };
}
function completeStep(step, at = new Date().toISOString()) {
  return { ...step, status: 'completed', completedAt: at, updatedAt: at };
}
function failStep(step, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...step, status: 'failed', failureReason: reason, completedAt: at, updatedAt: at };
}
function validateDns(record, at = new Date().toISOString()) {
  return { ...record, status: 'validated', validatedAt: at, updatedAt: at };
}
function startDnsPropagation(record, at = new Date().toISOString()) {
  return { ...record, status: 'propagating', propagationStartedAt: at, updatedAt: at };
}
function completeDns(record, at = new Date().toISOString()) {
  return { ...record, status: 'completed', completedAt: at, updatedAt: at };
}
function approveCommunication(comm, approvedBy, at = new Date().toISOString()) {
  if (!approvedBy) throw validationError('approvedBy is required');
  return { ...comm, status: 'approved', approvedBy, approvedAt: at, updatedAt: at };
}
function sendCommunication(comm, at = new Date().toISOString()) {
  return { ...comm, status: 'sent', sentAt: at, updatedAt: at };
}
function recommendRollback(decision, reason, impactSummary = '', at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...decision, status: 'recommended', reason, impactSummary, decidedAt: at, updatedAt: at };
}
function approveRollback(decision, decidedBy, at = new Date().toISOString()) {
  if (!decidedBy) throw validationError('decidedBy is required');
  return { ...decision, status: 'approved', decidedBy, decidedAt: at, updatedAt: at };
}
function executeRollback(decision, at = new Date().toISOString()) {
  return { ...decision, status: 'executed', executedAt: at, updatedAt: at };
}
function resolveIssue(issue, resolution, at = new Date().toISOString()) {
  if (!resolution) throw validationError('resolution is required');
  return { ...issue, status: 'resolved', resolution, resolvedAt: at, updatedAt: at };
}
function closeIssue(issue, at = new Date().toISOString()) {
  return { ...issue, status: 'closed', closedAt: at, updatedAt: at };
}
function publishDailyReport(report, publishedBy, at = new Date().toISOString()) {
  if (!publishedBy) throw validationError('publishedBy is required');
  return { ...report, status: 'published', publishedBy, publishedAt: at, updatedAt: at };
}
function stepsComplete(steps = []) {
  return steps.length > 0 && steps.every(x => ['completed', 'skipped'].includes(x.status));
}
function goLiveReady({ checklist = [], cutoverPlans = [], dns = [] }) {
  const checklistReady = checklist.filter(x => x.severity !== 'low').every(x => ['completed', 'waived'].includes(x.status));
  const cutoverReady = cutoverPlans.some(x => ['approved', 'running', 'completed'].includes(x.status));
  const dnsReady = dns.every(x => ['validated', 'propagating', 'completed'].includes(x.status));
  return checklistReady && cutoverReady && dnsReady;
}
function hypercareMetrics({ checklist = [], cutoverPlans = [], steps = [], dns = [], communications = [], decisions = [], issues = [], reports = [] }) {
  return {
    completedChecklist: checklist.filter(x => x.status === 'completed').length,
    blockedChecklist: checklist.filter(x => x.status === 'blocked').length,
    activeCutovers: cutoverPlans.filter(x => ['approved', 'running'].includes(x.status)).length,
    completedSteps: steps.filter(x => x.status === 'completed').length,
    completedDnsRecords: dns.filter(x => x.status === 'completed').length,
    sentCommunications: communications.filter(x => x.status === 'sent').length,
    executedRollbacks: decisions.filter(x => x.status === 'executed').length,
    openIssues: issues.filter(x => ['open', 'in_progress'].includes(x.status)).length,
    criticalIssues: issues.filter(x => x.severity === 'critical' && ['open', 'in_progress'].includes(x.status)).length,
    publishedReports: reports.filter(x => x.status === 'published').length
  };
}

module.exports = {
  CHECKLIST_STATUSES, CUTOVER_STATUSES, STEP_STATUSES, DNS_STATUSES, COMM_STATUSES,
  ROLLBACK_STATUSES, ISSUE_STATUSES, SEVERITIES, REPORT_STATUSES, assertAllowed, slugCode,
  addDays, normalizeChecklistInput, normalizeCutoverPlanInput, normalizeCutoverStepInput,
  normalizeDnsCutoverInput, normalizeLaunchCommunicationInput, normalizeRollbackDecisionInput,
  normalizeHypercareIssueInput, normalizeDailyReportInput, completeChecklist, waiveChecklist,
  approveCutover, startCutover, completeCutover, failCutover, rollbackCutover, startStep,
  completeStep, failStep, validateDns, startDnsPropagation, completeDns, approveCommunication,
  sendCommunication, recommendRollback, approveRollback, executeRollback, resolveIssue,
  closeIssue, publishDailyReport, stepsComplete, goLiveReady, hypercareMetrics
};
