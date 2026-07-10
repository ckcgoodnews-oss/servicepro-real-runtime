const { validationError } = require('../errors/domainError');

const RISK_STATUSES = ['draft', 'active', 'mitigating', 'accepted', 'closed', 'retired'];
const RISK_CATEGORIES = ['security', 'privacy', 'financial', 'operational', 'compliance', 'vendor', 'technology', 'other'];
const RISK_LEVELS = ['low', 'medium', 'high', 'critical'];
const PLAN_STATUSES = ['planned', 'in_progress', 'completed', 'blocked', 'cancelled'];
const KRI_STATUSES = ['healthy', 'warning', 'breached', 'unknown'];
const REVIEW_STATUSES = ['scheduled', 'completed', 'overdue', 'cancelled'];
const ACCEPTANCE_STATUSES = ['pending', 'approved', 'rejected', 'expired', 'revoked'];

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

function riskScore(likelihood, impact) {
  const l = Math.max(1, Math.min(5, Number(likelihood || 1)));
  const i = Math.max(1, Math.min(5, Number(impact || 1)));
  return l * i;
}

function riskLevel(score) {
  const s = Number(score || 0);
  if (s >= 20) return 'critical';
  if (s >= 12) return 'high';
  if (s >= 6) return 'medium';
  return 'low';
}

function normalizeRiskInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'active';
  const category = input.category || 'operational';
  assertAllowed(status, RISK_STATUSES, 'risk status');
  assertAllowed(category, RISK_CATEGORIES, 'risk category');
  const inherentScore = riskScore(input.inherentLikelihood || 3, input.inherentImpact || 3);
  const residualScore = riskScore(input.residualLikelihood || input.inherentLikelihood || 3, input.residualImpact || input.inherentImpact || 3);
  return {
    tenantId: input.tenantId,
    riskNumber: input.riskNumber || '',
    title: input.title,
    description: input.description || '',
    status,
    category,
    owner: input.owner || '',
    businessUnit: input.businessUnit || '',
    inherentLikelihood: Number(input.inherentLikelihood || 3),
    inherentImpact: Number(input.inherentImpact || 3),
    inherentScore,
    inherentLevel: riskLevel(inherentScore),
    residualLikelihood: Number(input.residualLikelihood || input.inherentLikelihood || 3),
    residualImpact: Number(input.residualImpact || input.inherentImpact || 3),
    residualScore,
    residualLevel: riskLevel(residualScore),
    identifiedAt: input.identifiedAt || new Date().toISOString(),
    nextReviewAt: input.nextReviewAt || addDays(new Date().toISOString(), 90),
    closedAt: input.closedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeMitigationPlanInput(input = {}) {
  if (!input.riskId) throw validationError('riskId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'planned';
  assertAllowed(status, PLAN_STATUSES, 'mitigation plan status');
  return {
    riskId: input.riskId,
    tenantId: input.tenantId || '',
    title: input.title,
    description: input.description || '',
    status,
    owner: input.owner || '',
    dueAt: input.dueAt || '',
    completedAt: input.completedAt || '',
    expectedResidualLikelihood: input.expectedResidualLikelihood === undefined ? null : Number(input.expectedResidualLikelihood),
    expectedResidualImpact: input.expectedResidualImpact === undefined ? null : Number(input.expectedResidualImpact),
    metadata: input.metadata || {}
  };
}

function normalizeKriInput(input = {}) {
  if (!input.riskId) throw validationError('riskId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'unknown';
  assertAllowed(status, KRI_STATUSES, 'KRI status');
  return {
    riskId: input.riskId,
    tenantId: input.tenantId || '',
    name: input.name,
    description: input.description || '',
    status,
    currentValue: input.currentValue === undefined ? null : Number(input.currentValue),
    warningThreshold: input.warningThreshold === undefined ? null : Number(input.warningThreshold),
    breachThreshold: input.breachThreshold === undefined ? null : Number(input.breachThreshold),
    operator: input.operator || 'gte',
    observedAt: input.observedAt || new Date().toISOString(),
    metadata: input.metadata || {}
  };
}

function normalizeReviewInput(input = {}) {
  if (!input.riskId) throw validationError('riskId is required');
  const status = input.status || 'scheduled';
  assertAllowed(status, REVIEW_STATUSES, 'risk review status');
  return {
    riskId: input.riskId,
    tenantId: input.tenantId || '',
    status,
    reviewer: input.reviewer || '',
    scheduledAt: input.scheduledAt || new Date().toISOString(),
    completedAt: input.completedAt || '',
    notes: input.notes || '',
    residualLikelihood: input.residualLikelihood === undefined ? null : Number(input.residualLikelihood),
    residualImpact: input.residualImpact === undefined ? null : Number(input.residualImpact),
    metadata: input.metadata || {}
  };
}

function normalizeAcceptanceInput(input = {}) {
  if (!input.riskId) throw validationError('riskId is required');
  if (!input.reason) throw validationError('reason is required');
  const status = input.status || 'pending';
  assertAllowed(status, ACCEPTANCE_STATUSES, 'risk acceptance status');
  return {
    riskId: input.riskId,
    tenantId: input.tenantId || '',
    status,
    reason: input.reason,
    requestedBy: input.requestedBy || '',
    requestedAt: input.requestedAt || new Date().toISOString(),
    approvedBy: input.approvedBy || '',
    approvedAt: input.approvedAt || '',
    expiresAt: input.expiresAt || '',
    revokedAt: input.revokedAt || '',
    metadata: input.metadata || {}
  };
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

function evaluateKri(kri) {
  if (kri.breachThreshold !== null && compareValue(kri.currentValue, kri.operator, kri.breachThreshold)) {
    return { ...kri, status: 'breached' };
  }
  if (kri.warningThreshold !== null && compareValue(kri.currentValue, kri.operator, kri.warningThreshold)) {
    return { ...kri, status: 'warning' };
  }
  return { ...kri, status: 'healthy' };
}

function completeMitigationPlan(plan, at = new Date().toISOString()) {
  return { ...plan, status: 'completed', completedAt: at, updatedAt: at };
}

function applyMitigationToRisk(risk, plan, at = new Date().toISOString()) {
  const residualLikelihood = plan.expectedResidualLikelihood || risk.residualLikelihood;
  const residualImpact = plan.expectedResidualImpact || risk.residualImpact;
  const residualScore = riskScore(residualLikelihood, residualImpact);
  return { ...risk, status: 'mitigating', residualLikelihood, residualImpact, residualScore, residualLevel: riskLevel(residualScore), updatedAt: at };
}

function completeReview(review, notes = '', at = new Date().toISOString()) {
  return { ...review, status: 'completed', notes: notes || review.notes, completedAt: at, updatedAt: at };
}

function applyReviewToRisk(risk, review, at = new Date().toISOString()) {
  const residualLikelihood = review.residualLikelihood || risk.residualLikelihood;
  const residualImpact = review.residualImpact || risk.residualImpact;
  const residualScore = riskScore(residualLikelihood, residualImpact);
  return { ...risk, residualLikelihood, residualImpact, residualScore, residualLevel: riskLevel(residualScore), nextReviewAt: addDays(at, 90), updatedAt: at };
}

function approveAcceptance(acceptance, approvedBy, at = new Date().toISOString()) {
  if (!approvedBy) throw validationError('approvedBy is required');
  return { ...acceptance, status: 'approved', approvedBy, approvedAt: at, updatedAt: at };
}

function rejectAcceptance(acceptance, approvedBy, at = new Date().toISOString()) {
  if (!approvedBy) throw validationError('approvedBy is required');
  return { ...acceptance, status: 'rejected', approvedBy, approvedAt: at, updatedAt: at };
}

function closeRisk(risk, at = new Date().toISOString()) {
  return { ...risk, status: 'closed', closedAt: at, updatedAt: at };
}

function isAcceptanceActive(acceptance, asOf = new Date().toISOString()) {
  if (acceptance.status !== 'approved') return false;
  if (!acceptance.expiresAt) return true;
  return new Date(asOf).getTime() <= new Date(acceptance.expiresAt).getTime();
}

function riskMetrics(risks = [], kris = []) {
  return {
    totalRisks: risks.length,
    activeRisks: risks.filter(x => ['active', 'mitigating', 'accepted'].includes(x.status)).length,
    criticalRisks: risks.filter(x => x.residualLevel === 'critical' && x.status !== 'closed').length,
    highRisks: risks.filter(x => x.residualLevel === 'high' && x.status !== 'closed').length,
    breachedKris: kris.filter(x => x.status === 'breached').length
  };
}

module.exports = {
  RISK_STATUSES,
  RISK_CATEGORIES,
  RISK_LEVELS,
  PLAN_STATUSES,
  KRI_STATUSES,
  REVIEW_STATUSES,
  ACCEPTANCE_STATUSES,
  slugCode,
  addDays,
  riskScore,
  riskLevel,
  normalizeRiskInput,
  normalizeMitigationPlanInput,
  normalizeKriInput,
  normalizeReviewInput,
  normalizeAcceptanceInput,
  compareValue,
  evaluateKri,
  completeMitigationPlan,
  applyMitigationToRisk,
  completeReview,
  applyReviewToRisk,
  approveAcceptance,
  rejectAcceptance,
  closeRisk,
  isAcceptanceActive,
  riskMetrics
};
