const { validationError } = require('../errors/domainError');

const ACTIVITY_STATUSES = ['draft', 'active', 'under_review', 'retired'];
const DATA_SENSITIVITY = ['public', 'internal', 'confidential', 'restricted', 'special_category'];
const DATA_SUBJECT_TYPES = ['customer', 'employee', 'contractor', 'prospect', 'vendor', 'other'];
const MAPPING_STATUSES = ['active', 'deprecated', 'retired'];
const DPIA_STATUSES = ['draft', 'in_review', 'approved', 'requires_mitigation', 'rejected', 'retired'];
const RISK_LEVELS = ['low', 'medium', 'high', 'critical'];
const DECISION_TYPES = ['approve', 'approve_with_conditions', 'mitigate', 'reject', 'escalate'];
const TASK_STATUSES = ['open', 'in_progress', 'completed', 'blocked', 'cancelled'];

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

function normalizeActivityInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'active';
  assertAllowed(status, ACTIVITY_STATUSES, 'processing activity status');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    status,
    owner: input.owner || '',
    businessUnit: input.businessUnit || '',
    purpose: input.purpose || '',
    lawfulBasis: input.lawfulBasis || 'legitimate_interest',
    dataSubjectTypes: Array.isArray(input.dataSubjectTypes) ? input.dataSubjectTypes : [],
    retentionPolicyId: input.retentionPolicyId || '',
    lastReviewedAt: input.lastReviewedAt || '',
    nextReviewAt: input.nextReviewAt || addDays(new Date().toISOString(), 365),
    metadata: input.metadata || {}
  };
}

function normalizeDataCategoryInput(input = {}) {
  if (!input.activityId) throw validationError('activityId is required');
  if (!input.name) throw validationError('name is required');
  const sensitivity = input.sensitivity || 'confidential';
  assertAllowed(sensitivity, DATA_SENSITIVITY, 'data sensitivity');
  return {
    activityId: input.activityId,
    tenantId: input.tenantId || '',
    name: input.name,
    description: input.description || '',
    sensitivity,
    dataSubjectType: input.dataSubjectType || 'customer',
    fields: Array.isArray(input.fields) ? input.fields : [],
    specialCategory: input.specialCategory === true,
    metadata: input.metadata || {}
  };
}

function normalizeSystemMappingInput(input = {}) {
  if (!input.activityId) throw validationError('activityId is required');
  if (!input.systemName) throw validationError('systemName is required');
  const status = input.status || 'active';
  assertAllowed(status, MAPPING_STATUSES, 'system mapping status');
  return {
    activityId: input.activityId,
    tenantId: input.tenantId || '',
    systemName: input.systemName,
    systemOwner: input.systemOwner || '',
    status,
    processingRole: input.processingRole || 'controller',
    region: input.region || '',
    vendorId: input.vendorId || '',
    transferMechanism: input.transferMechanism || '',
    metadata: input.metadata || {}
  };
}

function normalizeDpiaInput(input = {}) {
  if (!input.activityId) throw validationError('activityId is required');
  const status = input.status || 'draft';
  const inherentRisk = input.inherentRisk || 'medium';
  const residualRisk = input.residualRisk || inherentRisk;
  assertAllowed(status, DPIA_STATUSES, 'DPIA status');
  assertAllowed(inherentRisk, RISK_LEVELS, 'inherent risk');
  assertAllowed(residualRisk, RISK_LEVELS, 'residual risk');
  return {
    activityId: input.activityId,
    tenantId: input.tenantId || '',
    status,
    assessor: input.assessor || '',
    startedAt: input.startedAt || new Date().toISOString(),
    completedAt: input.completedAt || '',
    inherentRisk,
    residualRisk,
    summary: input.summary || '',
    necessityAssessment: input.necessityAssessment || '',
    proportionalityAssessment: input.proportionalityAssessment || '',
    consultationRequired: input.consultationRequired === true,
    metadata: input.metadata || {}
  };
}

function normalizeDecisionInput(input = {}) {
  if (!input.dpiaId) throw validationError('dpiaId is required');
  if (!input.decidedBy) throw validationError('decidedBy is required');
  const decisionType = input.decisionType || 'approve';
  assertAllowed(decisionType, DECISION_TYPES, 'DPIA decision type');
  return {
    dpiaId: input.dpiaId,
    tenantId: input.tenantId || '',
    decisionType,
    decidedBy: input.decidedBy,
    decidedAt: input.decidedAt || new Date().toISOString(),
    rationale: input.rationale || '',
    conditions: Array.isArray(input.conditions) ? input.conditions : [],
    metadata: input.metadata || {}
  };
}

function normalizeTaskInput(input = {}) {
  if (!input.dpiaId) throw validationError('dpiaId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'open';
  assertAllowed(status, TASK_STATUSES, 'DPIA remediation task status');
  return {
    dpiaId: input.dpiaId,
    activityId: input.activityId || '',
    tenantId: input.tenantId || '',
    title: input.title,
    description: input.description || '',
    status,
    owner: input.owner || '',
    dueAt: input.dueAt || '',
    completedAt: input.completedAt || '',
    metadata: input.metadata || {}
  };
}

function riskRank(level) {
  return { low: 1, medium: 2, high: 3, critical: 4 }[level] || 0;
}

function deriveActivityRisk(dataCategories = [], systemMappings = []) {
  const hasSpecial = dataCategories.some(x => x.specialCategory || x.sensitivity === 'special_category');
  const hasRestricted = dataCategories.some(x => x.sensitivity === 'restricted');
  const crossBorder = systemMappings.some(x => x.region && !String(x.region).toLowerCase().startsWith('us'));
  if (hasSpecial && crossBorder) return 'critical';
  if (hasSpecial || hasRestricted || crossBorder) return 'high';
  if (dataCategories.some(x => x.sensitivity === 'confidential')) return 'medium';
  return 'low';
}

function submitDpia(dpia, at = new Date().toISOString()) {
  return { ...dpia, status: 'in_review', updatedAt: at };
}

function approveDpia(dpia, at = new Date().toISOString()) {
  return { ...dpia, status: 'approved', completedAt: at, updatedAt: at };
}

function requireMitigation(dpia, at = new Date().toISOString()) {
  return { ...dpia, status: 'requires_mitigation', updatedAt: at };
}

function rejectDpia(dpia, at = new Date().toISOString()) {
  return { ...dpia, status: 'rejected', completedAt: at, updatedAt: at };
}

function completeTask(task, at = new Date().toISOString()) {
  return { ...task, status: 'completed', completedAt: at, updatedAt: at };
}

function reviewActivity(activity, at = new Date().toISOString()) {
  return { ...activity, status: 'active', lastReviewedAt: at, nextReviewAt: addDays(at, 365), updatedAt: at };
}

function isReviewDue(activity, asOf = new Date().toISOString()) {
  if (!activity.nextReviewAt) return true;
  return new Date(asOf).getTime() >= new Date(activity.nextReviewAt).getTime();
}

function inventoryMetrics({ activities = [], categories = [], mappings = [], dpias = [], tasks = [] }) {
  return {
    activeActivities: activities.filter(x => x.status === 'active').length,
    specialCategoryActivities: new Set(categories.filter(x => x.specialCategory || x.sensitivity === 'special_category').map(x => x.activityId)).size,
    activeSystemMappings: mappings.filter(x => x.status === 'active').length,
    openDpias: dpias.filter(x => ['draft', 'in_review', 'requires_mitigation'].includes(x.status)).length,
    highRiskDpias: dpias.filter(x => ['high', 'critical'].includes(x.residualRisk) && x.status !== 'approved').length,
    openTasks: tasks.filter(x => ['open', 'in_progress', 'blocked'].includes(x.status)).length
  };
}

module.exports = {
  ACTIVITY_STATUSES,
  DATA_SENSITIVITY,
  DATA_SUBJECT_TYPES,
  MAPPING_STATUSES,
  DPIA_STATUSES,
  RISK_LEVELS,
  DECISION_TYPES,
  TASK_STATUSES,
  slugCode,
  addDays,
  normalizeActivityInput,
  normalizeDataCategoryInput,
  normalizeSystemMappingInput,
  normalizeDpiaInput,
  normalizeDecisionInput,
  normalizeTaskInput,
  riskRank,
  deriveActivityRisk,
  submitDpia,
  approveDpia,
  requireMitigation,
  rejectDpia,
  completeTask,
  reviewActivity,
  isReviewDue,
  inventoryMetrics
};
