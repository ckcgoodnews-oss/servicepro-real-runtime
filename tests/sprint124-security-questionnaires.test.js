const fs = require('fs');

const required = [
  'apps/api/src/services/securityQuestionnaireService.js',
  'apps/api/src/repositories/securityQuestionnaireRepository.js',
  'apps/api/src/routes/securityQuestionnaires.js',
  'scripts/seed-security-questionnaires.js',
  'packages/database/postgres/124_security_questionnaires.sql',
  'docs/sprint124-security-questionnaires.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 124 patch file: ${file}`);
    process.exit(1);
  }
}

const {
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
} = require('../apps/api/src/services/securityQuestionnaireService');

let questionnaire = normalizeQuestionnaireInput({ tenantId: 'tenant_demo', customerName: 'Customer Co', receivedAt: '2026-07-07T00:00:00.000Z' });
if (!questionnaire.dueAt.startsWith('2026-07-17')) process.exit(1);

const answer = { id: 'answer1', ...normalizeAnswerLibraryInput({ tenantId: 'tenant_demo', questionPattern: 'encrypt data at rest', answerText: 'Yes, data is encrypted at rest.' }) };
let question = normalizeQuestionInput({ questionnaireId: 'q1', questionText: 'Do you encrypt data at rest?' });
const matched = matchAnswer(question.questionText, [answer]);
if (!matched.answer || matched.confidence < 75) process.exit(1);

question = applySuggestedAnswer(question, matched.answer, matched.confidence);
if (!question.answerText) process.exit(1);
question = approveQuestion(question);
if (question.status !== 'approved') process.exit(1);
const rejectedQuestion = rejectQuestion({ ...question, status: 'needs_review' });
if (rejectedQuestion.status !== 'rejected') process.exit(1);

questionnaire = submitForReview(questionnaire);
if (questionnaire.status !== 'in_review') process.exit(1);
let review = normalizeReviewInput({ questionnaireId: 'q1', reviewerId: 'legal' });
review = approveReview(review, 'ok');
if (review.status !== 'approved') process.exit(1);
const rejectedReview = rejectReview({ ...review, status: 'pending' }, 'no');
if (rejectedReview.status !== 'rejected') process.exit(1);

questionnaire = approveQuestionnaire(questionnaire);
questionnaire = markQuestionnaireSent(questionnaire);
if (questionnaire.status !== 'sent') process.exit(1);

let exportJob = normalizeExportJobInput({ questionnaireId: 'q1', format: 'xlsx' });
exportJob = startExport(exportJob);
exportJob = completeExport(exportJob, 's3://exports/q.xlsx');
if (exportJob.status !== 'completed') process.exit(1);
const failed = failExport(normalizeExportJobInput({ questionnaireId: 'q1' }), 'bad');
if (failed.status !== 'failed') process.exit(1);

const metrics = questionnaireMetrics({ questionnaires: [questionnaire], questions: [question], reviews: [review], exports: [exportJob] });
if (metrics.totalQuestionnaires !== 1 || metrics.completedExports !== 1) process.exit(1);

console.log('Sprint 124 security questionnaires patch test passed.');
