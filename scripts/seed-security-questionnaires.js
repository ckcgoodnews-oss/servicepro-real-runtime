const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const answer = await repos.securityQuestionnaires.createAnswer({
    tenantId,
    questionPattern: 'Do you encrypt data at rest',
    answerText: 'Yes. Customer data is encrypted at rest using managed encryption keys.',
    owner: 'security',
    tags: ['encryption', 'data-protection']
  });

  const questionnaire = await repos.securityQuestionnaires.createQuestionnaire({
    tenantId,
    customerName: 'Customer Co',
    customerContactEmail: 'security@customer.example',
    owner: 'security'
  });

  const question = await repos.securityQuestionnaires.createQuestion({
    questionnaireId: questionnaire.id,
    tenantId,
    section: 'Data Security',
    questionKey: 'DS-1',
    questionText: 'Do you encrypt data at rest?'
  });

  const approvedQuestion = await repos.securityQuestionnaires.approveQuestion(question.id);
  const inReview = await repos.securityQuestionnaires.submitForReview(questionnaire.id);

  const review = await repos.securityQuestionnaires.createReview({
    questionnaireId: questionnaire.id,
    tenantId,
    reviewerId: 'legal',
    reviewerName: 'Legal'
  });

  const approvedReview = await repos.securityQuestionnaires.approveReview(review.id, 'Approved to send.');
  const sent = await repos.securityQuestionnaires.markSent(questionnaire.id);

  const exportJob = await repos.securityQuestionnaires.createExport({
    questionnaireId: questionnaire.id,
    tenantId,
    format: 'xlsx',
    requestedBy: 'security'
  });
  await repos.securityQuestionnaires.startExport(exportJob.id);
  const completedExport = await repos.securityQuestionnaires.completeExport(exportJob.id, 's3://questionnaires/customer-co.xlsx');

  const metrics = await repos.securityQuestionnaires.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, answer, questionnaire: sent, question: approvedQuestion, inReview, review: approvedReview, exportJob: completedExport, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
