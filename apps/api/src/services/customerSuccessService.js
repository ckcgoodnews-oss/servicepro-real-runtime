const { validationError } = require('../errors/domainError');

const ACCOUNT_PLAN_STATUSES = ['draft', 'active', 'at_risk', 'closed'];
const MILESTONE_STATUSES = ['not_started', 'in_progress', 'completed', 'blocked', 'cancelled'];
const TASK_STATUSES = ['open', 'in_progress', 'completed', 'cancelled'];
const TASK_PRIORITIES = ['low', 'normal', 'high', 'urgent'];
const QBR_STATUSES = ['planned', 'completed', 'cancelled'];
const RISK_LEVELS = ['low', 'medium', 'high', 'critical'];

function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizeAccountPlanInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.accountName) throw validationError('accountName is required');

  const status = input.status || 'active';
  if (!ACCOUNT_PLAN_STATUSES.includes(status)) throw validationError(`Unsupported account plan status: ${status}`);

  return {
    tenantId: input.tenantId,
    accountName: input.accountName,
    status,
    successManager: input.successManager || '',
    executiveSponsor: input.executiveSponsor || '',
    healthScore: Number(input.healthScore === undefined ? 70 : input.healthScore),
    renewalDate: input.renewalDate || '',
    goals: Array.isArray(input.goals) ? input.goals : [],
    risks: Array.isArray(input.risks) ? input.risks : [],
    metadata: input.metadata || {}
  };
}

function normalizeMilestoneInput(input = {}) {
  if (!input.accountPlanId) throw validationError('accountPlanId is required');
  if (!input.name) throw validationError('name is required');

  const status = input.status || 'not_started';
  if (!MILESTONE_STATUSES.includes(status)) throw validationError(`Unsupported milestone status: ${status}`);

  return {
    accountPlanId: input.accountPlanId,
    name: input.name,
    description: input.description || '',
    status,
    targetDate: input.targetDate || '',
    completedAt: input.completedAt || '',
    owner: input.owner || '',
    weight: Number(input.weight || 1),
    metadata: input.metadata || {}
  };
}

function normalizeSuccessTaskInput(input = {}) {
  if (!input.accountPlanId) throw validationError('accountPlanId is required');
  if (!input.title) throw validationError('title is required');

  const status = input.status || 'open';
  const priority = input.priority || 'normal';

  if (!TASK_STATUSES.includes(status)) throw validationError(`Unsupported success task status: ${status}`);
  if (!TASK_PRIORITIES.includes(priority)) throw validationError(`Unsupported success task priority: ${priority}`);

  return {
    accountPlanId: input.accountPlanId,
    title: input.title,
    description: input.description || '',
    status,
    priority,
    owner: input.owner || '',
    dueDate: input.dueDate || '',
    completedAt: input.completedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeQbrInput(input = {}) {
  if (!input.accountPlanId) throw validationError('accountPlanId is required');
  if (!input.title) throw validationError('title is required');

  const status = input.status || 'planned';
  if (!QBR_STATUSES.includes(status)) throw validationError(`Unsupported QBR status: ${status}`);

  return {
    accountPlanId: input.accountPlanId,
    title: input.title,
    status,
    scheduledAt: input.scheduledAt || '',
    completedAt: input.completedAt || '',
    attendees: Array.isArray(input.attendees) ? input.attendees : [],
    agenda: Array.isArray(input.agenda) ? input.agenda : [],
    outcomes: Array.isArray(input.outcomes) ? input.outcomes : [],
    metadata: input.metadata || {}
  };
}

function normalizeRenewalRiskInput(input = {}) {
  if (!input.accountPlanId) throw validationError('accountPlanId is required');
  if (!input.reason) throw validationError('reason is required');

  const riskLevel = input.riskLevel || 'medium';
  if (!RISK_LEVELS.includes(riskLevel)) throw validationError(`Unsupported risk level: ${riskLevel}`);

  return {
    accountPlanId: input.accountPlanId,
    riskLevel,
    reason: input.reason,
    mitigationPlan: input.mitigationPlan || '',
    owner: input.owner || '',
    openedAt: input.openedAt || new Date().toISOString(),
    resolvedAt: input.resolvedAt || '',
    metadata: input.metadata || {}
  };
}

function completeMilestone(milestone, completedAt = new Date().toISOString()) {
  return { ...milestone, status: 'completed', completedAt, updatedAt: completedAt };
}

function completeTask(task, completedAt = new Date().toISOString()) {
  return { ...task, status: 'completed', completedAt, updatedAt: completedAt };
}

function completeQbr(qbr, outcomes = [], completedAt = new Date().toISOString()) {
  return { ...qbr, status: 'completed', outcomes: Array.isArray(outcomes) ? outcomes : qbr.outcomes, completedAt, updatedAt: completedAt };
}

function resolveRenewalRisk(risk, resolvedAt = new Date().toISOString()) {
  return { ...risk, resolvedAt, updatedAt: resolvedAt };
}

function calculateAdoptionScore({ milestones = [], tasks = [] }) {
  const milestoneWeight = milestones.reduce((sum, x) => sum + Number(x.weight || 1), 0);
  const completedWeight = milestones.filter(x => x.status === 'completed').reduce((sum, x) => sum + Number(x.weight || 1), 0);
  const milestoneScore = milestoneWeight ? (completedWeight / milestoneWeight) * 70 : 0;

  const taskCount = tasks.length;
  const completedTasks = tasks.filter(x => x.status === 'completed').length;
  const taskScore = taskCount ? (completedTasks / taskCount) * 30 : 0;

  const score = Math.round((milestoneScore + taskScore) * 100) / 100;
  return {
    score,
    status: score >= 85 ? 'strong' : score >= 65 ? 'steady' : score >= 40 ? 'needs_attention' : 'poor',
    completedMilestones: milestones.filter(x => x.status === 'completed').length,
    totalMilestones: milestones.length,
    completedTasks,
    totalTasks: taskCount
  };
}

function calculateRenewalRisk({ accountPlan, risks = [], adoptionScore = 0 }) {
  let points = 0;
  for (const risk of risks.filter(x => !x.resolvedAt)) {
    if (risk.riskLevel === 'critical') points += 40;
    else if (risk.riskLevel === 'high') points += 25;
    else if (risk.riskLevel === 'medium') points += 15;
    else points += 5;
  }
  if (Number(accountPlan && accountPlan.healthScore || 0) < 50) points += 25;
  if (Number(adoptionScore || 0) < 50) points += 20;

  const riskScore = Math.min(100, points);
  return {
    riskScore,
    riskLevel: riskScore >= 75 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low',
    openRisks: risks.filter(x => !x.resolvedAt).length
  };
}

module.exports = {
  ACCOUNT_PLAN_STATUSES,
  MILESTONE_STATUSES,
  TASK_STATUSES,
  TASK_PRIORITIES,
  QBR_STATUSES,
  RISK_LEVELS,
  slugCode,
  normalizeAccountPlanInput,
  normalizeMilestoneInput,
  normalizeSuccessTaskInput,
  normalizeQbrInput,
  normalizeRenewalRiskInput,
  completeMilestone,
  completeTask,
  completeQbr,
  resolveRenewalRisk,
  calculateAdoptionScore,
  calculateRenewalRisk
};
