const fs = require('fs');

const required = [
  'apps/api/src/services/surveyService.js',
  'apps/api/src/repositories/surveyRepository.js',
  'apps/api/src/routes/surveys.js',
  'scripts/seed-surveys.js',
  'packages/database/postgres/092_customer_surveys_runtime.sql',
  'docs/sprint92-customer-surveys-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 92 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  makeSurveyToken,
  normalizeSurveyTemplateInput,
  normalizeSurveySendInput,
  normalizeSurveyResponseInput,
  scoreSurveyResponse,
  summarizeSurveyResponses
} = require('../apps/api/src/services/surveyService');

if (makeSurveyToken().length !== 36) {
  console.error('Survey token generation failed.');
  process.exit(1);
}

const template = normalizeSurveyTemplateInput({
  name: 'Job Survey',
  questions: [
    { code: 'CSAT', label: 'Satisfaction', questionType: 'rating_1_5' },
    { code: 'NPS', label: 'Recommend', questionType: 'nps_0_10' }
  ]
});
if (template.questions.length !== 2) {
  console.error('Survey template normalization failed.');
  process.exit(1);
}

const send = normalizeSurveySendInput({ templateId: 'tmpl1', customerId: 'cust1', entityType: 'job', entityId: 'job1' });
if (!send.token || send.status !== 'queued') {
  console.error('Survey send normalization failed.');
  process.exit(1);
}

const response = normalizeSurveyResponseInput({
  surveySendId: 'send1',
  answers: [
    { questionType: 'rating_1_5', value: 5 },
    { questionType: 'nps_0_10', value: 10 }
  ]
});
const score = scoreSurveyResponse(response);
if (score.csatScore !== 5 || score.npsCategory !== 'promoter') {
  console.error('Survey scoring failed.');
  process.exit(1);
}

const summary = summarizeSurveyResponses([
  { answers: [{ questionType: 'rating_1_5', value: 5 }, { questionType: 'nps_0_10', value: 10 }] },
  { answers: [{ questionType: 'rating_1_5', value: 3 }, { questionType: 'nps_0_10', value: 4 }] }
]);
if (summary.averageCsat !== 4 || summary.nps !== 0) {
  console.error('Survey summary failed.');
  process.exit(1);
}

console.log('Sprint 92 customer surveys runtime patch test passed.');
