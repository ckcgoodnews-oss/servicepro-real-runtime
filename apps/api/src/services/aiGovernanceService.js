const { validationError } = require('../errors/domainError');

const SYSTEM_STATUSES = ['draft', 'active', 'paused', 'retired'];
const SYSTEM_TYPES = ['rules', 'ml_model', 'generative_ai', 'recommendation', 'classification', 'automation', 'other'];
const RISK_TIERS = ['minimal', 'limited', 'high', 'prohibited'];
const ASSESSMENT_STATUSES = ['draft', 'in_review', 'approved', 'requires_mitigation', 'rejected', 'retired'];
const APPROVAL_STATUSES = ['pending', 'approved', 'rejected', 'expired'];
const SIGNAL_STATUSES = ['healthy', 'warning', 'breached', 'unknown'];
const INCIDENT_STATUSES = ['open', 'investigating', 'mitigated', 'closed', 'false_positive'];
const INCIDENT_SEVERITIES = ['low', 'medium', 'high', 'critical'];

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

function normalizeSystemInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'draft';
  const systemType = input.systemType || 'other';
  const riskTier = input.riskTier || 'limited';
  assertAllowed(status, SYSTEM_STATUSES, 'AI system status');
  assertAllowed(systemType, SYSTEM_TYPES, 'AI system type');
  assertAllowed(riskTier, RISK_TIERS, 'AI risk tier');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    status,
    systemType,
    riskTier,
    owner: input.owner || '',
    businessUnit: input.businessUnit || '',
    vendorName: input.vendorName || '',
    modelName: input.modelName || '',
    modelVersion: input.modelVersion || '',
    useCase: input.useCase || '',
    dataCategories: Array.isArray(input.dataCategories) ? input.dataCategories : [],
    userImpact: input.userImpact || '',
    lastReviewedAt: input.lastReviewedAt || '',
    nextReviewAt: input.nextReviewAt || addDays(new Date().toISOString(), 180),
    metadata: input.metadata || {}
  };
}

function normalizeAssessmentInput(input = {}) {
  if (!input.aiSystemId) throw validationError('aiSystemId is required');
  const status = input.status || 'draft';
  const inherentRisk = input.inherentRisk || 'limited';
  const residualRisk = input.residualRisk || inherentRisk;
  assertAllowed(status, ASSESSMENT_STATUSES, 'assessment status');
  assertAllowed(inherentRisk, RISK_TIERS, 'inherent risk');
  assertAllowed(residualRisk, RISK_TIERS, 'residual risk');
  return {
    aiSystemId: input.aiSystemId,
    tenantId: input.tenantId || '',
    status,
    assessor: input.assessor || '',
    startedAt: input.startedAt || new Date().toISOString(),
    completedAt: input.completedAt || '',
    inherentRisk,
    residualRisk,
    biasRisk: input.biasRisk || 'unknown',
    privacyRisk: input.privacyRisk || 'unknown',
    securityRisk: input.securityRisk || 'unknown',
    explainabilityNotes: input.explainabilityNotes || '',
    humanOversight: input.humanOversight === true,
    mitigationPlan: input.mitigationPlan || '',
    metadata: input.metadata || {}
  };
}

function normalizeApprovalInput(input = {}) {
  if (!input.assessmentId) throw validationError('assessmentId is required');
  if (!input.approverId) throw validationError('approverId is required');
  const status = input.status || 'pending';
  assertAllowed(status, APPROVAL_STATUSES, 'approval status');
  return {
    assessmentId: input.assessmentId,
    aiSystemId: input.aiSystemId || '',
    tenantId: input.tenantId || '',
    approverId: input.approverId,
    approverName: input.approverName || '',
    status,
    requestedAt: input.requestedAt || new Date().toISOString(),
    respondedAt: input.respondedAt || '',
    comments: input.comments || '',
    expiresAt: input.expiresAt || addDays(new Date().toISOString(), 30),
    metadata: input.metadata || {}
  };
}

function normalizeSignalInput(input = {}) {
  if (!input.aiSystemId) throw validationError('aiSystemId is required');
  if (!input.signalName) throw validationError('signalName is required');
  const status = input.status || 'unknown';
  assertAllowed(status, SIGNAL_STATUSES, 'monitoring signal status');
  return {
    aiSystemId: input.aiSystemId,
    tenantId: input.tenantId || '',
    signalName: input.signalName,
    status,
    value: input.value === undefined ? null : input.value,
    numericValue: input.numericValue === undefined || input.numericValue === null ? null : Number(input.numericValue),
    warningThreshold: input.warningThreshold === undefined || input.warningThreshold === null ? null : Number(input.warningThreshold),
    breachThreshold: input.breachThreshold === undefined || input.breachThreshold === null ? null : Number(input.breachThreshold),
    operator: input.operator || 'gte',
    observedAt: input.observedAt || new Date().toISOString(),
    metadata: input.metadata || {}
  };
}

function normalizeIncidentInput(input = {}) {
  if (!input.aiSystemId) throw validationError('aiSystemId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'open';
  const severity = input.severity || 'medium';
  assertAllowed(status, INCIDENT_STATUSES, 'AI incident status');
  assertAllowed(severity, INCIDENT_SEVERITIES, 'AI incident severity');
  return {
    aiSystemId: input.aiSystemId,
    tenantId: input.tenantId || '',
    title: input.title,
    description: input.description || '',
    status,
    severity,
    reportedBy: input.reportedBy || '',
    reportedAt: input.reportedAt || new Date().toISOString(),
    mitigatedAt: input.mitigatedAt || '',
    closedAt: input.closedAt || '',
    linkedIncidentId: input.linkedIncidentId || '',
    metadata: input.metadata || {}
  };
}

function riskRank(tier) {
  return { minimal: 1, limited: 2, high: 3, prohibited: 4 }[tier] || 0;
}

function deriveRiskTier(system) {
  const hasSensitive = (system.dataCategories || []).some(x => ['health', 'financial', 'credentials', 'government_id', 'children', 'special_category'].includes(x));
  const highImpact = String(system.userImpact || '').toLowerCase().includes('eligibility') || String(system.userImpact || '').toLowerCase().includes('safety');
  if (system.systemType === 'automation' && highImpact) return 'high';
  if (system.systemType === 'generative_ai' && hasSensitive) return 'high';
  if (hasSensitive) return 'limited';
  return 'minimal';
}

function submitAssessment(assessment, assessor, at = new Date().toISOString()) {
  if (!assessor) throw validationError('assessor is required');
  return { ...assessment, status: 'in_review', assessor, updatedAt: at };
}

function approveAssessment(assessment, at = new Date().toISOString()) {
  return { ...assessment, status: 'approved', completedAt: at, updatedAt: at };
}

function requireMitigation(assessment, at = new Date().toISOString()) {
  return { ...assessment, status: 'requires_mitigation', updatedAt: at };
}

function rejectAssessment(assessment, at = new Date().toISOString()) {
  return { ...assessment, status: 'rejected', completedAt: at, updatedAt: at };
}

function approveGate(approval, comments = '', at = new Date().toISOString()) {
  return { ...approval, status: 'approved', comments, respondedAt: at, updatedAt: at };
}

function rejectGate(approval, comments = '', at = new Date().toISOString()) {
  return { ...approval, status: 'rejected', comments, respondedAt: at, updatedAt: at };
}

function activateSystem(system, at = new Date().toISOString()) {
  if (system.riskTier === 'prohibited') throw validationError('prohibited AI systems cannot be activated');
  return { ...system, status: 'active', updatedAt: at };
}

function pauseSystem(system, at = new Date().toISOString()) {
  return { ...system, status: 'paused', updatedAt: at };
}

function compareValue(value, operator, threshold) {
  const v = Number(value);
  const t = Number(threshold);
  if (Number.isNaN(v) || Number.isNaN(t)) return false;
  if (operator === 'gt') return v > t;
  if (operator === 'gte') return v >= t;
  if (operator === 'lt') return v < t;
  if (operator === 'lte') return v <= t;
  if (operator === 'eq') return v === t;
  if (operator === 'neq') return v !== t;
  throw validationError(`Unsupported operator: ${operator}`);
}

function evaluateSignal(signal) {
  if (signal.breachThreshold !== null && compareValue(signal.numericValue, signal.operator, signal.breachThreshold)) return { ...signal, status: 'breached' };
  if (signal.warningThreshold !== null && compareValue(signal.numericValue, signal.operator, signal.warningThreshold)) return { ...signal, status: 'warning' };
  return { ...signal, status: 'healthy' };
}

function mitigateIncident(incident, at = new Date().toISOString()) {
  return { ...incident, status: 'mitigated', mitigatedAt: at, updatedAt: at };
}

function closeIncident(incident, at = new Date().toISOString()) {
  return { ...incident, status: 'closed', closedAt: at, updatedAt: at };
}

function reviewSystem(system, at = new Date().toISOString()) {
  return { ...system, lastReviewedAt: at, nextReviewAt: addDays(at, 180), updatedAt: at };
}

function aiGovernanceMetrics({ systems = [], assessments = [], approvals = [], signals = [], incidents = [] }) {
  return {
    activeSystems: systems.filter(x => x.status === 'active').length,
    highRiskSystems: systems.filter(x => x.riskTier === 'high').length,
    openAssessments: assessments.filter(x => ['draft', 'in_review', 'requires_mitigation'].includes(x.status)).length,
    pendingApprovals: approvals.filter(x => x.status === 'pending').length,
    breachedSignals: signals.filter(x => x.status === 'breached').length,
    openIncidents: incidents.filter(x => ['open', 'investigating'].includes(x.status)).length
  };
}

module.exports = {
  SYSTEM_STATUSES,
  SYSTEM_TYPES,
  RISK_TIERS,
  ASSESSMENT_STATUSES,
  APPROVAL_STATUSES,
  SIGNAL_STATUSES,
  INCIDENT_STATUSES,
  INCIDENT_SEVERITIES,
  slugCode,
  addDays,
  normalizeSystemInput,
  normalizeAssessmentInput,
  normalizeApprovalInput,
  normalizeSignalInput,
  normalizeIncidentInput,
  riskRank,
  deriveRiskTier,
  submitAssessment,
  approveAssessment,
  requireMitigation,
  rejectAssessment,
  approveGate,
  rejectGate,
  activateSystem,
  pauseSystem,
  compareValue,
  evaluateSignal,
  mitigateIncident,
  closeIncident,
  reviewSystem,
  aiGovernanceMetrics
};
