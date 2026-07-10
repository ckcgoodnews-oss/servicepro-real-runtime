const { validationError } = require('../errors/domainError');

const REMINDER_ENTITY_TYPES = ['customer', 'job', 'invoice', 'estimate', 'agreement', 'asset'];
const REMINDER_STATUSES = ['open', 'snoozed', 'completed', 'cancelled'];
const REMINDER_PRIORITIES = ['low', 'normal', 'high', 'urgent'];

function addDays(dateString, days) {
  const d = new Date(`${dateString}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw validationError('Invalid date');
  d.setUTCDate(d.getUTCDate() + Number(days || 0));
  return d.toISOString().slice(0, 10);
}

function normalizeReminderRuleInput(input = {}) {
  if (!input.name) throw validationError('name is required');
  if (!input.triggerType) throw validationError('triggerType is required');

  return {
    name: input.name,
    description: input.description || '',
    triggerType: input.triggerType,
    entityType: input.entityType || 'customer',
    offsetDays: Number(input.offsetDays || 0),
    defaultPriority: input.defaultPriority || 'normal',
    defaultChannel: input.defaultChannel || 'internal_note',
    active: input.active !== false,
    metadata: input.metadata || {}
  };
}

function normalizeFollowUpInput(input = {}) {
  if (!input.customerId) throw validationError('customerId is required');
  if (!input.title) throw validationError('title is required');

  const entityType = input.entityType || 'customer';
  if (!REMINDER_ENTITY_TYPES.includes(entityType)) throw validationError(`Unsupported follow-up entity type: ${entityType}`);

  const status = input.status || 'open';
  if (!REMINDER_STATUSES.includes(status)) throw validationError(`Unsupported follow-up status: ${status}`);

  const priority = input.priority || 'normal';
  if (!REMINDER_PRIORITIES.includes(priority)) throw validationError(`Unsupported follow-up priority: ${priority}`);

  return {
    customerId: input.customerId,
    entityType,
    entityId: input.entityId || input.customerId,
    jobId: input.jobId || '',
    invoiceId: input.invoiceId || '',
    estimateId: input.estimateId || '',
    agreementId: input.agreementId || '',
    assignedTo: input.assignedTo || '',
    title: input.title,
    description: input.description || '',
    dueDate: input.dueDate || addDays(new Date().toISOString().slice(0, 10), 1),
    status,
    priority,
    channel: input.channel || 'internal_note',
    completedAt: input.completedAt || '',
    snoozedUntil: input.snoozedUntil || '',
    sourceRuleId: input.sourceRuleId || '',
    metadata: input.metadata || {}
  };
}

function isDue(followUp, today = new Date().toISOString().slice(0, 10)) {
  if (!['open', 'snoozed'].includes(followUp.status)) return false;
  if (followUp.status === 'snoozed' && followUp.snoozedUntil && followUp.snoozedUntil > today) return false;
  return Boolean(followUp.dueDate && followUp.dueDate <= today);
}

function isOverdue(followUp, today = new Date().toISOString().slice(0, 10)) {
  return isDue(followUp, today) && followUp.dueDate < today;
}

function completeFollowUp(followUp, completedAt = new Date().toISOString()) {
  return {
    ...followUp,
    status: 'completed',
    completedAt,
    updatedAt: completedAt
  };
}

function snoozeFollowUp(followUp, snoozedUntil) {
  if (!snoozedUntil) throw validationError('snoozedUntil is required');
  return {
    ...followUp,
    status: 'snoozed',
    snoozedUntil,
    updatedAt: new Date().toISOString()
  };
}

function followUpSummary(followUp = {}, today = new Date().toISOString().slice(0, 10)) {
  return {
    id: followUp.id,
    customerId: followUp.customerId,
    entityType: followUp.entityType,
    entityId: followUp.entityId,
    title: followUp.title,
    dueDate: followUp.dueDate,
    status: followUp.status,
    priority: followUp.priority,
    due: isDue(followUp, today),
    overdue: isOverdue(followUp, today)
  };
}

module.exports = {
  REMINDER_ENTITY_TYPES,
  REMINDER_STATUSES,
  REMINDER_PRIORITIES,
  addDays,
  normalizeReminderRuleInput,
  normalizeFollowUpInput,
  isDue,
  isOverdue,
  completeFollowUp,
  snoozeFollowUp,
  followUpSummary
};
