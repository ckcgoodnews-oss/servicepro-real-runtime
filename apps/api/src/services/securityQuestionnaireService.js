const { validationError } = require('../errors/domainError');

const QUESTIONNAIRE_STATUSES = ['received', 'in_progress', 'in_review', 'approved', 'sent', 'closed', 'cancelled'];
const QUESTION_STATUSES = ['open', 'answered', 'needs_review', 'approved', 'rejected'];
const ANSWER_STATUSES = ['draft', 'reviewed', 'approved', 'retired'];
const REVIEW_STATUSES = ['pending', 'approved', 'rejected'];
const EXPORT_STATUSES = ['queued', 'running', 'completed', 'failed', 'cancelled'];
const EXPORT_FORMATS = ['xlsx', 'csv', 'json', 'pdf'];

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

function normalizeQuestionnaireInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.customerName) throw validationError('customerName is required');
  const status = input.status || 'received';
  assertAllowed(status, QUESTIONNAIRE_STATUSES, 'questionnaire status');
  const receivedAt = input.receivedAt || new Date().toISOString();
  return {
    tenantId: input.tenantId,
    questionnaireNumber: input.questionnaireNumber || '',
    customerName: input.customerName,
    customerContactEmail: input.customerContactEmail || '',
    status,
    owner: input.owner || '',
    receivedAt,
    dueAt: input.dueAt || addDays(receivedAt, 10),
    approvedAt: input.approvedAt || '',
    sentAt: input.sentAt || '',
    sourceFileUrl: input.sourceFileUrl || '',
    metadata: input.metadata || {}
  };
}

function normalizeQuestionInput(input = {}) {
  if (!input.questionnaireId) throw validationError('questionnaireId is required');
  if (!input.questionText) throw validationError('questionText is required');
  const status = input.status || 'open';
  assertAllowed(status, QUESTION_STATUSES, 'question status');
  return {
    questionnaireId: input.questionnaireId,
    tenantId: input.tenantId || '',
    section: input.section || '',
    questionKey: input.questionKey || '',
    questionText: input.questionText,
    status,
    assignedTo: input.assignedTo || '',
    answerText: input.answerText || '',
    sourceAnswerId: input.sourceAnswerId || '',
    confidence: Number(input.confidence || 0),
    metadata: input.metadata || {}
  };
}

function normalizeAnswerLibraryInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.questionPattern) throw validationError('questionPattern is required');
  if (!input.answerText) throw validationError('answerText is required');
  const status = input.status || 'approved';
  assertAllowed(status, ANSWER_STATUSES, 'answer status');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.questionPattern).slice(0, 64),
    questionPattern: input.questionPattern,
    answerText: input.answerText,
    status,
    owner: input.owner || '',
    tags: Array.isArray(input.tags) ? input.tags : [],
    evidenceLinks: Array.isArray(input.evidenceLinks) ? input.evidenceLinks : [],
    lastReviewedAt: input.lastReviewedAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeReviewInput(input = {}) {
  if (!input.questionnaireId) throw validationError('questionnaireId is required');
  if (!input.reviewerId) throw validationError('reviewerId is required');
  const status = input.status || 'pending';
  assertAllowed(status, REVIEW_STATUSES, 'review status');
  return {
    questionnaireId: input.questionnaireId,
    tenantId: input.tenantId || '',
    reviewerId: input.reviewerId,
    reviewerName: input.reviewerName || '',
    status,
    requestedAt: input.requestedAt || new Date().toISOString(),
    respondedAt: input.respondedAt || '',
    comments: input.comments || '',
    metadata: input.metadata || {}
  };
}

function normalizeExportJobInput(input = {}) {
  if (!input.questionnaireId) throw validationError('questionnaireId is required');
  const status = input.status || 'queued';
  const format = input.format || 'xlsx';
  assertAllowed(status, EXPORT_STATUSES, 'export status');
  assertAllowed(format, EXPORT_FORMATS, 'export format');
  return {
    questionnaireId: input.questionnaireId,
    tenantId: input.tenantId || '',
    status,
    format,
    requestedBy: input.requestedBy || '',
    requestedAt: input.requestedAt || new Date().toISOString(),
    startedAt: input.startedAt || '',
    completedAt: input.completedAt || '',
    outputUrl: input.outputUrl || '',
    errorMessage: input.errorMessage || '',
    metadata: input.metadata || {}
  };
}

function normalizeText(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function matchAnswer(questionText, library = []) {
  const q = normalizeText(questionText);
  let best = null;
  let score = 0;
  for (const answer of library.filter(x => x.status === 'approved')) {
    const p = normalizeText(answer.questionPattern);
    if (!p) continue;
    const words = p.split(' ').filter(Boolean);
    const hits = words.filter(w => q.includes(w)).length;
    const current = words.length ? hits / words.length : 0;
    if (current > score) {
      score = current;
      best = answer;
    }
  }
  return best ? { answer: best, confidence: Math.round(score * 100) } : { answer: null, confidence: 0 };
}

function applySuggestedAnswer(question, answer, confidence = 0, at = new Date().toISOString()) {
  if (!answer) return question;
  return {
    ...question,
    status: confidence >= 80 ? 'answered' : 'needs_review',
    answerText: answer.answerText,
    sourceAnswerId: answer.id || '',
    confidence,
    updatedAt: at
  };
}

function approveQuestion(question, at = new Date().toISOString()) {
  return { ...question, status: 'approved', updatedAt: at };
}

function rejectQuestion(question, at = new Date().toISOString()) {
  return { ...question, status: 'rejected', updatedAt: at };
}

function submitForReview(questionnaire, at = new Date().toISOString()) {
  return { ...questionnaire, status: 'in_review', updatedAt: at };
}

function approveReview(review, comments = '', at = new Date().toISOString()) {
  return { ...review, status: 'approved', comments, respondedAt: at, updatedAt: at };
}

function rejectReview(review, comments = '', at = new Date().toISOString()) {
  return { ...review, status: 'rejected', comments, respondedAt: at, updatedAt: at };
}

function approveQuestionnaire(questionnaire, at = new Date().toISOString()) {
  return { ...questionnaire, status: 'approved', approvedAt: at, updatedAt: at };
}

function markQuestionnaireSent(questionnaire, at = new Date().toISOString()) {
  return { ...questionnaire, status: 'sent', sentAt: at, updatedAt: at };
}

function startExport(job, at = new Date().toISOString()) {
  return { ...job, status: 'running', startedAt: at, updatedAt: at };
}

function completeExport(job, outputUrl, at = new Date().toISOString()) {
  if (!outputUrl) throw validationError('outputUrl is required');
  return { ...job, status: 'completed', outputUrl, completedAt: at, updatedAt: at };
}

function failExport(job, errorMessage, at = new Date().toISOString()) {
  return { ...job, status: 'failed', errorMessage: errorMessage || 'Export failed', completedAt: at, updatedAt: at };
}

function questionnaireMetrics({ questionnaires = [], questions = [], reviews = [], exports = [] }) {
  return {
    totalQuestionnaires: questionnaires.length,
    openQuestionnaires: questionnaires.filter(x => ['received', 'in_progress', 'in_review'].includes(x.status)).length,
    approvedQuestionnaires: questionnaires.filter(x => x.status === 'approved').length,
    unansweredQuestions: questions.filter(x => ['open', 'needs_review'].includes(x.status)).length,
    pendingReviews: reviews.filter(x => x.status === 'pending').length,
    completedExports: exports.filter(x => x.status === 'completed').length
  };
}

module.exports = {
  QUESTIONNAIRE_STATUSES,
  QUESTION_STATUSES,
  ANSWER_STATUSES,
  REVIEW_STATUSES,
  EXPORT_STATUSES,
  EXPORT_FORMATS,
  slugCode,
  addDays,
  normalizeQuestionnaireInput,
  normalizeQuestionInput,
  normalizeAnswerLibraryInput,
  normalizeReviewInput,
  normalizeExportJobInput,
  matchAnswer,
  applySuggestedAnswer,
  approveQuestion,
  rejectQuestion,
  submitForReview,
  approveReview,
  rejectReview,
  approveQuestionnaire,
  markQuestionnaireSent,
  startExport,
  completeExport,
  failExport,
  questionnaireMetrics
};
