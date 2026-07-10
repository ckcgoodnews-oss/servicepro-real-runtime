const { validationError } = require('../errors/domainError');

const COURSE_STATUSES = ['draft', 'active', 'retired', 'archived'];
const COURSE_TYPES = ['security', 'privacy', 'compliance', 'safety', 'operations', 'role_based', 'other'];
const CAMPAIGN_STATUSES = ['draft', 'scheduled', 'active', 'completed', 'cancelled'];
const ASSIGNMENT_STATUSES = ['assigned', 'in_progress', 'completed', 'overdue', 'waived', 'cancelled'];
const EVIDENCE_TYPES = ['lms', 'certificate', 'quiz', 'manual_attestation', 'import', 'other'];
const REMINDER_STATUSES = ['queued', 'sent', 'failed', 'cancelled'];
const EXCEPTION_STATUSES = ['requested', 'approved', 'rejected', 'expired', 'revoked'];

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

function normalizeCourseInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'active';
  const courseType = input.courseType || 'other';
  assertAllowed(status, COURSE_STATUSES, 'course status');
  assertAllowed(courseType, COURSE_TYPES, 'course type');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.title),
    title: input.title,
    description: input.description || '',
    status,
    courseType,
    owner: input.owner || '',
    durationMinutes: Number(input.durationMinutes || 30),
    contentUrl: input.contentUrl || '',
    passingScore: Number(input.passingScore || 80),
    renewalDays: Number(input.renewalDays || 365),
    metadata: input.metadata || {}
  };
}

function normalizeCampaignInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  if (!input.courseId) throw validationError('courseId is required');
  const status = input.status || 'draft';
  assertAllowed(status, CAMPAIGN_STATUSES, 'campaign status');
  return {
    tenantId: input.tenantId,
    courseId: input.courseId,
    name: input.name,
    description: input.description || '',
    status,
    targetRoles: Array.isArray(input.targetRoles) ? input.targetRoles : [],
    targetDepartments: Array.isArray(input.targetDepartments) ? input.targetDepartments : [],
    owner: input.owner || '',
    startsAt: input.startsAt || '',
    dueAt: input.dueAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeAssignmentInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.courseId) throw validationError('courseId is required');
  if (!input.subjectId) throw validationError('subjectId is required');
  const status = input.status || 'assigned';
  assertAllowed(status, ASSIGNMENT_STATUSES, 'assignment status');
  const assignedAt = input.assignedAt || new Date().toISOString();
  return {
    tenantId: input.tenantId,
    campaignId: input.campaignId || '',
    courseId: input.courseId,
    subjectId: input.subjectId,
    subjectName: input.subjectName || '',
    subjectEmail: input.subjectEmail || '',
    role: input.role || '',
    department: input.department || '',
    status,
    assignedAt,
    startedAt: input.startedAt || '',
    dueAt: input.dueAt || addDays(assignedAt, 14),
    completedAt: input.completedAt || '',
    score: input.score === undefined || input.score === null ? null : Number(input.score),
    metadata: input.metadata || {}
  };
}

function normalizeEvidenceInput(input = {}) {
  if (!input.assignmentId) throw validationError('assignmentId is required');
  const evidenceType = input.evidenceType || 'other';
  assertAllowed(evidenceType, EVIDENCE_TYPES, 'training evidence type');
  return {
    assignmentId: input.assignmentId,
    tenantId: input.tenantId || '',
    evidenceType,
    evidenceUrl: input.evidenceUrl || '',
    score: input.score === undefined || input.score === null ? null : Number(input.score),
    passed: input.passed === true,
    recordedBy: input.recordedBy || '',
    recordedAt: input.recordedAt || new Date().toISOString(),
    metadata: input.metadata || {}
  };
}

function normalizeReminderInput(input = {}) {
  if (!input.assignmentId) throw validationError('assignmentId is required');
  const status = input.status || 'queued';
  assertAllowed(status, REMINDER_STATUSES, 'reminder status');
  return {
    assignmentId: input.assignmentId,
    tenantId: input.tenantId || '',
    recipientEmail: input.recipientEmail || '',
    status,
    queuedAt: input.queuedAt || new Date().toISOString(),
    sentAt: input.sentAt || '',
    failedAt: input.failedAt || '',
    failureReason: input.failureReason || '',
    metadata: input.metadata || {}
  };
}

function normalizeExceptionInput(input = {}) {
  if (!input.assignmentId) throw validationError('assignmentId is required');
  if (!input.requesterId) throw validationError('requesterId is required');
  if (!input.reason) throw validationError('reason is required');
  const status = input.status || 'requested';
  assertAllowed(status, EXCEPTION_STATUSES, 'training exception status');
  return {
    assignmentId: input.assignmentId,
    tenantId: input.tenantId || '',
    requesterId: input.requesterId,
    requesterName: input.requesterName || '',
    reason: input.reason,
    status,
    decidedBy: input.decidedBy || '',
    decidedAt: input.decidedAt || '',
    expiresAt: input.expiresAt || addDays(new Date().toISOString(), 90),
    revokedAt: input.revokedAt || '',
    metadata: input.metadata || {}
  };
}

function scheduleCampaign(campaign, startsAt, dueAt, at = new Date().toISOString()) {
  if (!startsAt) throw validationError('startsAt is required');
  if (!dueAt) throw validationError('dueAt is required');
  return { ...campaign, status: 'scheduled', startsAt, dueAt, updatedAt: at };
}

function activateCampaign(campaign, at = new Date().toISOString()) {
  return { ...campaign, status: 'active', updatedAt: at };
}

function completeCampaign(campaign, at = new Date().toISOString()) {
  return { ...campaign, status: 'completed', updatedAt: at };
}

function startAssignment(assignment, at = new Date().toISOString()) {
  return { ...assignment, status: 'in_progress', startedAt: at, updatedAt: at };
}

function completeAssignment(assignment, score = null, at = new Date().toISOString()) {
  return { ...assignment, status: 'completed', score: score === null ? assignment.score : Number(score), completedAt: at, updatedAt: at };
}

function markAssignmentOverdue(assignment, asOf = new Date().toISOString()) {
  if (!['assigned', 'in_progress'].includes(assignment.status)) return assignment;
  if (assignment.dueAt && new Date(asOf).getTime() > new Date(assignment.dueAt).getTime()) {
    return { ...assignment, status: 'overdue', updatedAt: asOf };
  }
  return assignment;
}

function waiveAssignment(assignment, reason = '', at = new Date().toISOString()) {
  return { ...assignment, status: 'waived', metadata: { ...(assignment.metadata || {}), waiverReason: reason }, updatedAt: at };
}

function evidencePassesCourse(evidence, course) {
  if (evidence.passed === true) return true;
  if (evidence.score === null || evidence.score === undefined) return false;
  return Number(evidence.score) >= Number(course.passingScore || 80);
}

function sendReminder(reminder, at = new Date().toISOString()) {
  return { ...reminder, status: 'sent', sentAt: at, updatedAt: at };
}

function failReminder(reminder, reason = '', at = new Date().toISOString()) {
  return { ...reminder, status: 'failed', failureReason: reason || 'Reminder failed', failedAt: at, updatedAt: at };
}

function approveException(exception, decidedBy, at = new Date().toISOString()) {
  if (!decidedBy) throw validationError('decidedBy is required');
  return { ...exception, status: 'approved', decidedBy, decidedAt: at, updatedAt: at };
}

function rejectException(exception, decidedBy, at = new Date().toISOString()) {
  if (!decidedBy) throw validationError('decidedBy is required');
  return { ...exception, status: 'rejected', decidedBy, decidedAt: at, updatedAt: at };
}

function revokeException(exception, at = new Date().toISOString()) {
  return { ...exception, status: 'revoked', revokedAt: at, updatedAt: at };
}

function nextRenewalDate(assignment, course) {
  if (!assignment.completedAt) return '';
  return addDays(assignment.completedAt, course.renewalDays || 365);
}

function trainingMetrics({ courses = [], campaigns = [], assignments = [], reminders = [], exceptions = [] }) {
  return {
    activeCourses: courses.filter(x => x.status === 'active').length,
    activeCampaigns: campaigns.filter(x => x.status === 'active').length,
    assignedCount: assignments.filter(x => ['assigned', 'in_progress'].includes(x.status)).length,
    completedCount: assignments.filter(x => x.status === 'completed').length,
    overdueCount: assignments.filter(x => x.status === 'overdue').length,
    remindersSent: reminders.filter(x => x.status === 'sent').length,
    approvedExceptions: exceptions.filter(x => x.status === 'approved').length
  };
}

module.exports = {
  COURSE_STATUSES,
  COURSE_TYPES,
  CAMPAIGN_STATUSES,
  ASSIGNMENT_STATUSES,
  EVIDENCE_TYPES,
  REMINDER_STATUSES,
  EXCEPTION_STATUSES,
  slugCode,
  addDays,
  normalizeCourseInput,
  normalizeCampaignInput,
  normalizeAssignmentInput,
  normalizeEvidenceInput,
  normalizeReminderInput,
  normalizeExceptionInput,
  scheduleCampaign,
  activateCampaign,
  completeCampaign,
  startAssignment,
  completeAssignment,
  markAssignmentOverdue,
  waiveAssignment,
  evidencePassesCourse,
  sendReminder,
  failReminder,
  approveException,
  rejectException,
  revokeException,
  nextRenewalDate,
  trainingMetrics
};
