const { validationError } = require('../errors/domainError');

const FRAMEWORK_STATUSES = ['draft', 'active', 'retired'];
const CONTROL_STATUSES = ['draft', 'active', 'deprecated'];
const CONTROL_FREQUENCIES = ['continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'semiannual', 'annual'];
const EVIDENCE_TYPES = ['document', 'ticket', 'screenshot', 'log', 'attestation', 'report', 'other'];
const TEST_STATUSES = ['planned', 'in_progress', 'passed', 'failed', 'not_applicable'];
const GAP_STATUSES = ['open', 'in_remediation', 'accepted', 'closed'];
const ACTION_STATUSES = ['open', 'in_progress', 'completed', 'blocked', 'cancelled'];
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

function normalizeFrameworkInput(input = {}) {
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'active';
  assertAllowed(status, FRAMEWORK_STATUSES, 'framework status');
  return {
    code: input.code || slugCode(input.name),
    name: input.name,
    version: input.version || '',
    status,
    owner: input.owner || '',
    description: input.description || '',
    metadata: input.metadata || {}
  };
}

function normalizeControlInput(input = {}) {
  if (!input.frameworkId) throw validationError('frameworkId is required');
  if (!input.controlCode) throw validationError('controlCode is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'active';
  const frequency = input.frequency || 'quarterly';
  assertAllowed(status, CONTROL_STATUSES, 'control status');
  assertAllowed(frequency, CONTROL_FREQUENCIES, 'control frequency');
  return {
    frameworkId: input.frameworkId,
    controlCode: input.controlCode,
    title: input.title,
    description: input.description || '',
    status,
    owner: input.owner || '',
    frequency,
    category: input.category || '',
    automated: input.automated === true,
    metadata: input.metadata || {}
  };
}

function normalizeEvidenceMappingInput(input = {}) {
  if (!input.controlId) throw validationError('controlId is required');
  if (!input.title) throw validationError('title is required');
  const evidenceType = input.evidenceType || 'document';
  assertAllowed(evidenceType, EVIDENCE_TYPES, 'evidence type');
  return {
    controlId: input.controlId,
    title: input.title,
    evidenceType,
    sourceSystem: input.sourceSystem || '',
    sourceId: input.sourceId || '',
    uri: input.uri || '',
    collectedBy: input.collectedBy || '',
    collectedAt: input.collectedAt || new Date().toISOString(),
    validUntil: input.validUntil || '',
    metadata: input.metadata || {}
  };
}

function normalizeTestRunInput(input = {}) {
  if (!input.controlId) throw validationError('controlId is required');
  const status = input.status || 'planned';
  assertAllowed(status, TEST_STATUSES, 'test status');
  return {
    controlId: input.controlId,
    status,
    testedBy: input.testedBy || '',
    plannedAt: input.plannedAt || new Date().toISOString(),
    startedAt: input.startedAt || '',
    completedAt: input.completedAt || '',
    resultSummary: input.resultSummary || '',
    sampleSize: Number(input.sampleSize || 0),
    exceptionsFound: Number(input.exceptionsFound || 0),
    metadata: input.metadata || {}
  };
}

function normalizeGapInput(input = {}) {
  if (!input.controlId) throw validationError('controlId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'open';
  const severity = input.severity || 'medium';
  assertAllowed(status, GAP_STATUSES, 'gap status');
  assertAllowed(severity, SEVERITIES, 'gap severity');
  return {
    controlId: input.controlId,
    testRunId: input.testRunId || '',
    title: input.title,
    description: input.description || '',
    severity,
    status,
    owner: input.owner || '',
    dueAt: input.dueAt || '',
    closedAt: input.closedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeCorrectiveActionInput(input = {}) {
  if (!input.gapId) throw validationError('gapId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'open';
  assertAllowed(status, ACTION_STATUSES, 'corrective action status');
  return {
    gapId: input.gapId,
    title: input.title,
    description: input.description || '',
    status,
    owner: input.owner || '',
    dueAt: input.dueAt || '',
    completedAt: input.completedAt || '',
    metadata: input.metadata || {}
  };
}

function nextDueDate(control, fromDate = new Date().toISOString()) {
  const daysByFrequency = {
    continuous: 1,
    daily: 1,
    weekly: 7,
    monthly: 30,
    quarterly: 90,
    semiannual: 180,
    annual: 365
  };
  return addDays(fromDate, daysByFrequency[control.frequency] || 90);
}

function startTestRun(testRun, at = new Date().toISOString()) {
  return { ...testRun, status: 'in_progress', startedAt: at, updatedAt: at };
}

function completeTestRun(testRun, passed, resultSummary = '', at = new Date().toISOString()) {
  return { ...testRun, status: passed ? 'passed' : 'failed', resultSummary, completedAt: at, updatedAt: at };
}

function closeGap(gap, at = new Date().toISOString()) {
  return { ...gap, status: 'closed', closedAt: at, updatedAt: at };
}

function acceptGap(gap, at = new Date().toISOString()) {
  return { ...gap, status: 'accepted', updatedAt: at };
}

function completeCorrectiveAction(action, at = new Date().toISOString()) {
  return { ...action, status: 'completed', completedAt: at, updatedAt: at };
}

function evidenceIsFresh(evidence, asOf = new Date().toISOString()) {
  if (!evidence.validUntil) return true;
  return new Date(asOf).getTime() <= new Date(evidence.validUntil).getTime();
}

function controlCoverage({ controls = [], evidenceMappings = [], testRuns = [], gaps = [] }) {
  const activeControls = controls.filter(x => x.status === 'active');
  const testedControls = new Set(testRuns.filter(x => x.status === 'passed').map(x => x.controlId));
  const evidenceControls = new Set(evidenceMappings.map(x => x.controlId));
  const openGapControls = new Set(gaps.filter(x => ['open', 'in_remediation'].includes(x.status)).map(x => x.controlId));
  return {
    totalControls: activeControls.length,
    controlsWithEvidence: activeControls.filter(x => evidenceControls.has(x.id)).length,
    controlsPassed: activeControls.filter(x => testedControls.has(x.id)).length,
    controlsWithOpenGaps: activeControls.filter(x => openGapControls.has(x.id)).length
  };
}

module.exports = {
  FRAMEWORK_STATUSES,
  CONTROL_STATUSES,
  CONTROL_FREQUENCIES,
  EVIDENCE_TYPES,
  TEST_STATUSES,
  GAP_STATUSES,
  ACTION_STATUSES,
  SEVERITIES,
  slugCode,
  addDays,
  normalizeFrameworkInput,
  normalizeControlInput,
  normalizeEvidenceMappingInput,
  normalizeTestRunInput,
  normalizeGapInput,
  normalizeCorrectiveActionInput,
  nextDueDate,
  startTestRun,
  completeTestRun,
  closeGap,
  acceptGap,
  completeCorrectiveAction,
  evidenceIsFresh,
  controlCoverage
};
