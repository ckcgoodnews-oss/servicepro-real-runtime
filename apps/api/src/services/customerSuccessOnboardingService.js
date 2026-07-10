const { validationError } = require('../errors/domainError');

const COHORT_STATUSES = ['planned', 'active', 'completed', 'cancelled'];
const PLAN_STATUSES = ['not_started', 'in_progress', 'completed', 'blocked', 'cancelled'];
const TASK_STATUSES = ['pending', 'in_progress', 'completed', 'blocked', 'skipped'];
const METRIC_PERIODS = ['daily', 'weekly', 'monthly'];
const FEEDBACK_TYPES = ['nps', 'csat', 'feature_request', 'bug', 'general'];
const FEEDBACK_STATUSES = ['new', 'reviewed', 'planned', 'resolved', 'closed'];
const ESCALATION_STATUSES = ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'];
const SUCCESS_PLAN_STATUSES = ['draft', 'active', 'at_risk', 'completed', 'cancelled'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];

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
function normalizeCohortInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'planned';
  assertAllowed(status, COHORT_STATUSES, 'cohort status');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    status,
    launchDate: input.launchDate || '',
    owner: input.owner || '',
    customerTenantIds: Array.isArray(input.customerTenantIds) ? input.customerTenantIds : [],
    metadata: input.metadata || {}
  };
}
function normalizeOnboardingPlanInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.customerTenantId) throw validationError('customerTenantId is required');
  const status = input.status || 'not_started';
  assertAllowed(status, PLAN_STATUSES, 'onboarding plan status');
  return {
    tenantId: input.tenantId,
    customerTenantId: input.customerTenantId,
    cohortId: input.cohortId || '',
    customerName: input.customerName || '',
    status,
    owner: input.owner || '',
    startedAt: input.startedAt || '',
    targetCompletionAt: input.targetCompletionAt || addDays(new Date().toISOString(), 30),
    completedAt: input.completedAt || '',
    blockerSummary: input.blockerSummary || '',
    metadata: input.metadata || {}
  };
}
function normalizeTaskInput(input = {}) {
  if (!input.planId) throw validationError('planId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'pending';
  assertAllowed(status, TASK_STATUSES, 'task status');
  return {
    tenantId: input.tenantId || '',
    planId: input.planId,
    title: input.title,
    description: input.description || '',
    status,
    owner: input.owner || '',
    sequence: Number(input.sequence || 1),
    dueAt: input.dueAt || '',
    completedAt: input.completedAt || '',
    blockerReason: input.blockerReason || '',
    metadata: input.metadata || {}
  };
}
function normalizeAdoptionMetricInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.customerTenantId) throw validationError('customerTenantId is required');
  if (!input.metricName) throw validationError('metricName is required');
  const period = input.period || 'weekly';
  assertAllowed(period, METRIC_PERIODS, 'metric period');
  return {
    tenantId: input.tenantId,
    customerTenantId: input.customerTenantId,
    metricName: input.metricName,
    metricValue: Number(input.metricValue || 0),
    targetValue: input.targetValue === undefined || input.targetValue === null ? null : Number(input.targetValue),
    period,
    measuredAt: input.measuredAt || new Date().toISOString(),
    metadata: input.metadata || {}
  };
}
function normalizeFeedbackInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.customerTenantId) throw validationError('customerTenantId is required');
  if (!input.summary) throw validationError('summary is required');
  const feedbackType = input.feedbackType || 'general';
  const status = input.status || 'new';
  const severity = input.severity || 'medium';
  assertAllowed(feedbackType, FEEDBACK_TYPES, 'feedback type');
  assertAllowed(status, FEEDBACK_STATUSES, 'feedback status');
  assertAllowed(severity, SEVERITIES, 'feedback severity');
  return {
    tenantId: input.tenantId,
    customerTenantId: input.customerTenantId,
    feedbackType,
    status,
    severity,
    summary: input.summary,
    details: input.details || '',
    submittedBy: input.submittedBy || '',
    submittedAt: input.submittedAt || new Date().toISOString(),
    reviewedBy: input.reviewedBy || '',
    reviewedAt: input.reviewedAt || '',
    resolution: input.resolution || '',
    metadata: input.metadata || {}
  };
}
function normalizeEscalationInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.customerTenantId) throw validationError('customerTenantId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'open';
  const severity = input.severity || 'medium';
  assertAllowed(status, ESCALATION_STATUSES, 'escalation status');
  assertAllowed(severity, SEVERITIES, 'escalation severity');
  return {
    tenantId: input.tenantId,
    customerTenantId: input.customerTenantId,
    title: input.title,
    description: input.description || '',
    status,
    severity,
    owner: input.owner || '',
    openedAt: input.openedAt || new Date().toISOString(),
    resolvedAt: input.resolvedAt || '',
    closedAt: input.closedAt || '',
    resolution: input.resolution || '',
    metadata: input.metadata || {}
  };
}
function normalizeSuccessPlanInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.customerTenantId) throw validationError('customerTenantId is required');
  const status = input.status || 'draft';
  assertAllowed(status, SUCCESS_PLAN_STATUSES, 'success plan status');
  return {
    tenantId: input.tenantId,
    customerTenantId: input.customerTenantId,
    status,
    owner: input.owner || '',
    objectives: Array.isArray(input.objectives) ? input.objectives : [],
    risks: Array.isArray(input.risks) ? input.risks : [],
    nextBusinessReviewAt: input.nextBusinessReviewAt || addDays(new Date().toISOString(), 90),
    completedAt: input.completedAt || '',
    metadata: input.metadata || {}
  };
}
function activateCohort(cohort, at = new Date().toISOString()) {
  return { ...cohort, status: 'active', updatedAt: at };
}
function completeCohort(cohort, at = new Date().toISOString()) {
  return { ...cohort, status: 'completed', updatedAt: at };
}
function startPlan(plan, at = new Date().toISOString()) {
  return { ...plan, status: 'in_progress', startedAt: plan.startedAt || at, updatedAt: at };
}
function completePlan(plan, at = new Date().toISOString()) {
  return { ...plan, status: 'completed', completedAt: at, updatedAt: at };
}
function blockPlan(plan, blockerSummary, at = new Date().toISOString()) {
  if (!blockerSummary) throw validationError('blockerSummary is required');
  return { ...plan, status: 'blocked', blockerSummary, updatedAt: at };
}
function startTask(task, at = new Date().toISOString()) {
  return { ...task, status: 'in_progress', updatedAt: at };
}
function completeTask(task, at = new Date().toISOString()) {
  return { ...task, status: 'completed', completedAt: at, updatedAt: at };
}
function blockTask(task, blockerReason, at = new Date().toISOString()) {
  if (!blockerReason) throw validationError('blockerReason is required');
  return { ...task, status: 'blocked', blockerReason, updatedAt: at };
}
function reviewFeedback(feedback, reviewedBy, at = new Date().toISOString()) {
  if (!reviewedBy) throw validationError('reviewedBy is required');
  return { ...feedback, status: 'reviewed', reviewedBy, reviewedAt: at, updatedAt: at };
}
function resolveFeedback(feedback, resolution, at = new Date().toISOString()) {
  if (!resolution) throw validationError('resolution is required');
  return { ...feedback, status: 'resolved', resolution, updatedAt: at };
}
function startEscalation(escalation, owner = '', at = new Date().toISOString()) {
  return { ...escalation, status: 'in_progress', owner: owner || escalation.owner, updatedAt: at };
}
function resolveEscalation(escalation, resolution, at = new Date().toISOString()) {
  if (!resolution) throw validationError('resolution is required');
  return { ...escalation, status: 'resolved', resolution, resolvedAt: at, updatedAt: at };
}
function closeEscalation(escalation, at = new Date().toISOString()) {
  return { ...escalation, status: 'closed', closedAt: at, updatedAt: at };
}
function activateSuccessPlan(plan, at = new Date().toISOString()) {
  return { ...plan, status: 'active', updatedAt: at };
}
function markSuccessPlanAtRisk(plan, risk, at = new Date().toISOString()) {
  return { ...plan, status: 'at_risk', risks: [...(plan.risks || []), risk].filter(Boolean), updatedAt: at };
}
function completeSuccessPlan(plan, at = new Date().toISOString()) {
  return { ...plan, status: 'completed', completedAt: at, updatedAt: at };
}
function adoptionHealth(metric) {
  if (metric.targetValue === null || metric.targetValue === 0) return 'unknown';
  const ratio = Number(metric.metricValue || 0) / Number(metric.targetValue);
  if (ratio >= 1) return 'healthy';
  if (ratio >= 0.75) return 'watch';
  return 'at_risk';
}
function onboardingProgress(tasks = []) {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter(x => x.status === 'completed').length / tasks.length) * 100);
}
function customerSuccessMetrics({ cohorts = [], plans = [], tasks = [], metrics = [], feedback = [], escalations = [], successPlans = [] }) {
  return {
    activeCohorts: cohorts.filter(x => x.status === 'active').length,
    activeOnboardingPlans: plans.filter(x => ['not_started', 'in_progress', 'blocked'].includes(x.status)).length,
    completedOnboardingPlans: plans.filter(x => x.status === 'completed').length,
    completedTasks: tasks.filter(x => x.status === 'completed').length,
    atRiskAdoptionMetrics: metrics.filter(x => adoptionHealth(x) === 'at_risk').length,
    openFeedback: feedback.filter(x => ['new', 'reviewed', 'planned'].includes(x.status)).length,
    openEscalations: escalations.filter(x => ['open', 'in_progress', 'waiting_customer'].includes(x.status)).length,
    criticalEscalations: escalations.filter(x => x.severity === 'critical' && ['open', 'in_progress', 'waiting_customer'].includes(x.status)).length,
    activeSuccessPlans: successPlans.filter(x => x.status === 'active').length,
    atRiskSuccessPlans: successPlans.filter(x => x.status === 'at_risk').length
  };
}
module.exports = {
  COHORT_STATUSES, PLAN_STATUSES, TASK_STATUSES, METRIC_PERIODS, FEEDBACK_TYPES,
  FEEDBACK_STATUSES, ESCALATION_STATUSES, SUCCESS_PLAN_STATUSES, SEVERITIES,
  assertAllowed, slugCode, addDays, normalizeCohortInput, normalizeOnboardingPlanInput,
  normalizeTaskInput, normalizeAdoptionMetricInput, normalizeFeedbackInput,
  normalizeEscalationInput, normalizeSuccessPlanInput, activateCohort, completeCohort,
  startPlan, completePlan, blockPlan, startTask, completeTask, blockTask, reviewFeedback,
  resolveFeedback, startEscalation, resolveEscalation, closeEscalation, activateSuccessPlan,
  markSuccessPlanAtRisk, completeSuccessPlan, adoptionHealth, onboardingProgress,
  customerSuccessMetrics
};
