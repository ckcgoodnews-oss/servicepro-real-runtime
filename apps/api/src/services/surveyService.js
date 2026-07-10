const crypto = require('crypto');
const { validationError } = require('../errors/domainError');

const SURVEY_QUESTION_TYPES = ['rating_1_5', 'nps_0_10', 'yes_no', 'text'];
const SURVEY_SEND_STATUSES = ['draft', 'queued', 'sent', 'opened', 'completed', 'expired', 'void'];
const SURVEY_ENTITY_TYPES = ['customer', 'job', 'invoice', 'estimate', 'agreement'];

function makeSurveyToken() {
  return crypto.randomBytes(18).toString('hex');
}

function normalizeSurveyQuestion(input = {}) {
  if (!input.label) throw validationError('question label is required');
  const questionType = input.questionType || 'rating_1_5';
  if (!SURVEY_QUESTION_TYPES.includes(questionType)) throw validationError(`Unsupported survey question type: ${questionType}`);
  return {
    code: input.code || String(input.label).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''),
    label: input.label,
    questionType,
    required: input.required !== false,
    sortOrder: Number(input.sortOrder || 0),
    helpText: input.helpText || ''
  };
}

function normalizeSurveyTemplateInput(input = {}) {
  if (!input.name) throw validationError('name is required');
  return {
    code: input.code || String(input.name).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name: input.name,
    description: input.description || '',
    triggerType: input.triggerType || 'job.completed',
    active: input.active !== false,
    questions: Array.isArray(input.questions) ? input.questions.map(normalizeSurveyQuestion) : [],
    metadata: input.metadata || {}
  };
}

function normalizeSurveySendInput(input = {}) {
  if (!input.templateId) throw validationError('templateId is required');
  if (!input.customerId) throw validationError('customerId is required');
  const entityType = input.entityType || 'customer';
  if (!SURVEY_ENTITY_TYPES.includes(entityType)) throw validationError(`Unsupported survey entity type: ${entityType}`);
  const status = input.status || 'queued';
  if (!SURVEY_SEND_STATUSES.includes(status)) throw validationError(`Unsupported survey send status: ${status}`);

  return {
    templateId: input.templateId,
    customerId: input.customerId,
    entityType,
    entityId: input.entityId || input.customerId,
    jobId: input.jobId || '',
    invoiceId: input.invoiceId || '',
    email: input.email || '',
    phone: input.phone || '',
    status,
    token: input.token || makeSurveyToken(),
    sentAt: input.sentAt || '',
    openedAt: input.openedAt || '',
    completedAt: input.completedAt || '',
    expiresAt: input.expiresAt || '',
    metadata: input.metadata || {}
  };
}

function normalizeSurveyResponseInput(input = {}) {
  if (!input.surveySendId) throw validationError('surveySendId is required');
  const answers = Array.isArray(input.answers) ? input.answers : [];
  return {
    surveySendId: input.surveySendId,
    customerId: input.customerId || '',
    entityType: input.entityType || 'customer',
    entityId: input.entityId || '',
    jobId: input.jobId || '',
    invoiceId: input.invoiceId || '',
    answers,
    csatScore: Number(input.csatScore || 0),
    npsScore: input.npsScore === undefined || input.npsScore === '' ? null : Number(input.npsScore),
    comment: input.comment || '',
    submittedAt: input.submittedAt || new Date().toISOString(),
    metadata: input.metadata || {}
  };
}

function scoreSurveyResponse(response = {}) {
  const answers = Array.isArray(response.answers) ? response.answers : [];
  const ratingAnswers = answers.filter(a => a.questionType === 'rating_1_5' && Number(a.value) > 0);
  const npsAnswer = answers.find(a => a.questionType === 'nps_0_10' && Number(a.value) >= 0);

  const csatScore = ratingAnswers.length
    ? Math.round((ratingAnswers.reduce((sum, a) => sum + Number(a.value), 0) / ratingAnswers.length) * 100) / 100
    : Number(response.csatScore || 0);

  const npsScore = npsAnswer ? Number(npsAnswer.value) : response.npsScore;
  let npsCategory = '';
  if (npsScore !== null && npsScore !== undefined && npsScore !== '') {
    if (Number(npsScore) >= 9) npsCategory = 'promoter';
    else if (Number(npsScore) >= 7) npsCategory = 'passive';
    else npsCategory = 'detractor';
  }

  return {
    csatScore,
    npsScore: npsScore === undefined ? null : npsScore,
    npsCategory
  };
}

function summarizeSurveyResponses(responses = []) {
  const scored = responses.map(r => ({ ...r, scoring: scoreSurveyResponse(r) }));
  const csatRows = scored.filter(r => Number(r.scoring.csatScore) > 0);
  const npsRows = scored.filter(r => r.scoring.npsScore !== null && r.scoring.npsScore !== undefined);

  const promoters = npsRows.filter(r => r.scoring.npsCategory === 'promoter').length;
  const detractors = npsRows.filter(r => r.scoring.npsCategory === 'detractor').length;
  const nps = npsRows.length ? Math.round(((promoters - detractors) / npsRows.length) * 100) : null;

  return {
    responseCount: responses.length,
    averageCsat: csatRows.length ? Math.round((csatRows.reduce((sum, r) => sum + r.scoring.csatScore, 0) / csatRows.length) * 100) / 100 : 0,
    nps,
    promoters,
    passives: npsRows.filter(r => r.scoring.npsCategory === 'passive').length,
    detractors
  };
}

module.exports = {
  SURVEY_QUESTION_TYPES,
  SURVEY_SEND_STATUSES,
  SURVEY_ENTITY_TYPES,
  makeSurveyToken,
  normalizeSurveyQuestion,
  normalizeSurveyTemplateInput,
  normalizeSurveySendInput,
  normalizeSurveyResponseInput,
  scoreSurveyResponse,
  summarizeSurveyResponses
};
