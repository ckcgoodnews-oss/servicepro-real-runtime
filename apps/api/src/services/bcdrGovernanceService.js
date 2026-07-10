const { validationError } = require('../errors/domainError');

const BIA_STATUSES = ['draft', 'in_review', 'approved', 'retired'];
const CRITICALITY_LEVELS = ['low', 'medium', 'high', 'critical'];
const PLAN_STATUSES = ['draft', 'in_review', 'approved', 'active', 'retired'];
const APPROVAL_STATUSES = ['pending', 'approved', 'rejected', 'expired'];
const EXERCISE_TYPES = ['tabletop', 'technical_failover', 'restore_test', 'communications_test', 'full_dr'];
const EXERCISE_STATUSES = ['planned', 'running', 'completed', 'failed', 'cancelled'];
const EVIDENCE_TYPES = ['runbook', 'screenshot', 'log', 'report', 'attestation', 'other'];
const GAP_STATUSES = ['open', 'in_progress', 'completed', 'accepted_risk', 'cancelled'];

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

function normalizeBiaInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.processName) throw validationError('processName is required');
  const status = input.status || 'draft';
  const criticality = input.criticality || 'medium';
  assertAllowed(status, BIA_STATUSES, 'BIA status');
  assertAllowed(criticality, CRITICALITY_LEVELS, 'criticality');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.processName),
    processName: input.processName,
    description: input.description || '',
    status,
    criticality,
    owner: input.owner || '',
    businessUnit: input.businessUnit || '',
    maxTolerableDowntimeHours: Number(input.maxTolerableDowntimeHours || 24),
    rtoHours: Number(input.rtoHours || 8),
    rpoHours: Number(input.rpoHours || 4),
    dependencies: Array.isArray(input.dependencies) ? input.dependencies : [],
    impactSummary: input.impactSummary || '',
    reviewedAt: input.reviewedAt || '',
    approvedAt: input.approvedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizePlanInput(input = {}) {
  if (!input.biaId) throw validationError('biaId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'draft';
  assertAllowed(status, PLAN_STATUSES, 'recovery plan status');
  return {
    biaId: input.biaId,
    tenantId: input.tenantId || '',
    title: input.title,
    version: input.version || '1.0',
    status,
    owner: input.owner || '',
    recoveryStrategy: input.recoveryStrategy || '',
    runbookUrl: input.runbookUrl || '',
    rtoHours: Number(input.rtoHours || 8),
    rpoHours: Number(input.rpoHours || 4),
    lastTestedAt: input.lastTestedAt || '',
    nextTestAt: input.nextTestAt || addDays(new Date().toISOString(), 180),
    metadata: input.metadata || {}
  };
}

function normalizeApprovalInput(input = {}) {
  if (!input.planId) throw validationError('planId is required');
  if (!input.approverId) throw validationError('approverId is required');
  const status = input.status || 'pending';
  assertAllowed(status, APPROVAL_STATUSES, 'plan approval status');
  return {
    planId: input.planId,
    biaId: input.biaId || '',
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

function normalizeExerciseInput(input = {}) {
  if (!input.planId) throw validationError('planId is required');
  if (!input.name) throw validationError('name is required');
  const exerciseType = input.exerciseType || 'tabletop';
  const status = input.status || 'planned';
  assertAllowed(exerciseType, EXERCISE_TYPES, 'exercise type');
  assertAllowed(status, EXERCISE_STATUSES, 'exercise status');
  return {
    planId: input.planId,
    biaId: input.biaId || '',
    tenantId: input.tenantId || '',
    name: input.name,
    exerciseType,
    status,
    owner: input.owner || '',
    scheduledAt: input.scheduledAt || new Date().toISOString(),
    startedAt: input.startedAt || '',
    completedAt: input.completedAt || '',
    achievedRtoHours: input.achievedRtoHours === undefined || input.achievedRtoHours === null ? null : Number(input.achievedRtoHours),
    achievedRpoHours: input.achievedRpoHours === undefined || input.achievedRpoHours === null ? null : Number(input.achievedRpoHours),
    outcomeSummary: input.outcomeSummary || '',
    metadata: input.metadata || {}
  };
}

function normalizeEvidenceInput(input = {}) {
  if (!input.exerciseId) throw validationError('exerciseId is required');
  if (!input.title) throw validationError('title is required');
  const evidenceType = input.evidenceType || 'other';
  assertAllowed(evidenceType, EVIDENCE_TYPES, 'evidence type');
  return {
    exerciseId: input.exerciseId,
    planId: input.planId || '',
    tenantId: input.tenantId || '',
    evidenceType,
    title: input.title,
    fileUrl: input.fileUrl || '',
    collectedBy: input.collectedBy || '',
    collectedAt: input.collectedAt || new Date().toISOString(),
    metadata: input.metadata || {}
  };
}

function normalizeGapInput(input = {}) {
  if (!input.planId) throw validationError('planId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'open';
  const severity = input.severity || 'medium';
  assertAllowed(status, GAP_STATUSES, 'recovery gap status');
  assertAllowed(severity, CRITICALITY_LEVELS, 'gap severity');
  return {
    planId: input.planId,
    exerciseId: input.exerciseId || '',
    tenantId: input.tenantId || '',
    title: input.title,
    description: input.description || '',
    status,
    severity,
    owner: input.owner || '',
    dueAt: input.dueAt || '',
    completedAt: input.completedAt || '',
    acceptedReason: input.acceptedReason || '',
    metadata: input.metadata || {}
  };
}

function submitBia(bia, at = new Date().toISOString()) {
  return { ...bia, status: 'in_review', reviewedAt: at, updatedAt: at };
}

function approveBia(bia, at = new Date().toISOString()) {
  return { ...bia, status: 'approved', approvedAt: at, updatedAt: at };
}

function submitPlan(plan, at = new Date().toISOString()) {
  return { ...plan, status: 'in_review', updatedAt: at };
}

function approvePlan(plan, at = new Date().toISOString()) {
  return { ...plan, status: 'approved', updatedAt: at };
}

function activatePlan(plan, at = new Date().toISOString()) {
  return { ...plan, status: 'active', updatedAt: at };
}

function approveGate(approval, comments = '', at = new Date().toISOString()) {
  return { ...approval, status: 'approved', comments, respondedAt: at, updatedAt: at };
}

function rejectGate(approval, comments = '', at = new Date().toISOString()) {
  return { ...approval, status: 'rejected', comments, respondedAt: at, updatedAt: at };
}

function startExercise(exercise, at = new Date().toISOString()) {
  return { ...exercise, status: 'running', startedAt: at, updatedAt: at };
}

function completeExercise(exercise, achievedRtoHours = null, achievedRpoHours = null, summary = '', at = new Date().toISOString()) {
  return {
    ...exercise,
    status: 'completed',
    achievedRtoHours: achievedRtoHours === null ? exercise.achievedRtoHours : Number(achievedRtoHours),
    achievedRpoHours: achievedRpoHours === null ? exercise.achievedRpoHours : Number(achievedRpoHours),
    outcomeSummary: summary || exercise.outcomeSummary,
    completedAt: at,
    updatedAt: at
  };
}

function failExercise(exercise, summary = '', at = new Date().toISOString()) {
  return { ...exercise, status: 'failed', outcomeSummary: summary || exercise.outcomeSummary, completedAt: at, updatedAt: at };
}

function exerciseMetTargets(exercise, plan) {
  if (exercise.achievedRtoHours === null || exercise.achievedRpoHours === null) return false;
  return Number(exercise.achievedRtoHours) <= Number(plan.rtoHours) && Number(exercise.achievedRpoHours) <= Number(plan.rpoHours);
}

function applyExerciseToPlan(plan, exercise, at = new Date().toISOString()) {
  return { ...plan, lastTestedAt: exercise.completedAt || at, nextTestAt: addDays(exercise.completedAt || at, 180), updatedAt: at };
}

function completeGap(gap, at = new Date().toISOString()) {
  return { ...gap, status: 'completed', completedAt: at, updatedAt: at };
}

function acceptGapRisk(gap, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...gap, status: 'accepted_risk', acceptedReason: reason, updatedAt: at };
}

function bcdrMetrics({ bias = [], plans = [], approvals = [], exercises = [], gaps = [] }) {
  return {
    approvedBias: bias.filter(x => x.status === 'approved').length,
    activePlans: plans.filter(x => x.status === 'active').length,
    pendingApprovals: approvals.filter(x => x.status === 'pending').length,
    completedExercises: exercises.filter(x => x.status === 'completed').length,
    failedExercises: exercises.filter(x => x.status === 'failed').length,
    openGaps: gaps.filter(x => ['open', 'in_progress'].includes(x.status)).length,
    criticalGaps: gaps.filter(x => x.severity === 'critical' && ['open', 'in_progress'].includes(x.status)).length
  };
}

module.exports = {
  BIA_STATUSES,
  CRITICALITY_LEVELS,
  PLAN_STATUSES,
  APPROVAL_STATUSES,
  EXERCISE_TYPES,
  EXERCISE_STATUSES,
  EVIDENCE_TYPES,
  GAP_STATUSES,
  slugCode,
  addDays,
  normalizeBiaInput,
  normalizePlanInput,
  normalizeApprovalInput,
  normalizeExerciseInput,
  normalizeEvidenceInput,
  normalizeGapInput,
  submitBia,
  approveBia,
  submitPlan,
  approvePlan,
  activatePlan,
  approveGate,
  rejectGate,
  startExercise,
  completeExercise,
  failExercise,
  exerciseMetTargets,
  applyExerciseToPlan,
  completeGap,
  acceptGapRisk,
  bcdrMetrics
};
