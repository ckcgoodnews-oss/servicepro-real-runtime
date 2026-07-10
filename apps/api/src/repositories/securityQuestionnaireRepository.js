const { makeId, now } = require('../services/id');
const svc = require('../services/securityQuestionnaireService');

function createSecurityQuestionnaireRepository(store) {
  if (store.type === 'json') return createJsonSecurityQuestionnaireRepository(store);
  if (store.type === 'postgres') return createPostgresSecurityQuestionnaireRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureSq(data) {
  data.securityQuestionnaires ||= [];
  data.securityQuestionnaireQuestions ||= [];
  data.securityAnswerLibrary ||= [];
  data.securityQuestionnaireReviews ||= [];
  data.securityQuestionnaireExports ||= [];
  return data;
}

function createJsonSecurityQuestionnaireRepository(store) {
  return {
    listQuestionnaires(filters = {}) {
      return ensureSq(store.read()).securityQuestionnaires
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));
    },
    createQuestionnaire(input) {
      const data = ensureSq(store.read());
      const row = { id: makeId('secq'), ...svc.normalizeQuestionnaireInput(input), createdAt: now(), updatedAt: now() };
      row.questionnaireNumber = row.questionnaireNumber || `SQ-${String(data.securityQuestionnaires.length + 1).padStart(6, '0')}`;
      data.securityQuestionnaires.push(row);
      store.write(data);
      return row;
    },
    createQuestion(input) {
      const data = ensureSq(store.read());
      const normalized = svc.normalizeQuestionInput(input);
      const match = svc.matchAnswer(normalized.questionText, data.securityAnswerLibrary);
      const withAnswer = svc.applySuggestedAnswer(normalized, match.answer, match.confidence);
      const row = { id: makeId('secqq'), ...withAnswer, createdAt: now(), updatedAt: now() };
      data.securityQuestionnaireQuestions.push(row);
      store.write(data);
      return row;
    },
    listQuestions(questionnaireId) {
      return ensureSq(store.read()).securityQuestionnaireQuestions.filter(x => x.questionnaireId === questionnaireId);
    },
    approveQuestion(id) {
      const data = ensureSq(store.read());
      const idx = data.securityQuestionnaireQuestions.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.securityQuestionnaireQuestions[idx] = svc.approveQuestion(data.securityQuestionnaireQuestions[idx]);
      store.write(data);
      return data.securityQuestionnaireQuestions[idx];
    },
    rejectQuestion(id) {
      const data = ensureSq(store.read());
      const idx = data.securityQuestionnaireQuestions.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.securityQuestionnaireQuestions[idx] = svc.rejectQuestion(data.securityQuestionnaireQuestions[idx]);
      store.write(data);
      return data.securityQuestionnaireQuestions[idx];
    },
    createAnswer(input) {
      const data = ensureSq(store.read());
      const row = { id: makeId('secalib'), ...svc.normalizeAnswerLibraryInput(input), createdAt: now(), updatedAt: now() };
      data.securityAnswerLibrary.push(row);
      store.write(data);
      return row;
    },
    listAnswers(filters = {}) {
      return ensureSq(store.read()).securityAnswerLibrary
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.code).localeCompare(String(b.code)));
    },
    submitForReview(id) {
      const data = ensureSq(store.read());
      const idx = data.securityQuestionnaires.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.securityQuestionnaires[idx] = svc.submitForReview(data.securityQuestionnaires[idx]);
      store.write(data);
      return data.securityQuestionnaires[idx];
    },
    createReview(input) {
      const data = ensureSq(store.read());
      const row = { id: makeId('secqrev'), ...svc.normalizeReviewInput(input), createdAt: now(), updatedAt: now() };
      data.securityQuestionnaireReviews.push(row);
      store.write(data);
      return row;
    },
    approveReview(id, comments = '') {
      const data = ensureSq(store.read());
      const idx = data.securityQuestionnaireReviews.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.securityQuestionnaireReviews[idx] = svc.approveReview(data.securityQuestionnaireReviews[idx], comments);
      const qIdx = data.securityQuestionnaires.findIndex(x => x.id === data.securityQuestionnaireReviews[idx].questionnaireId);
      if (qIdx !== -1) data.securityQuestionnaires[qIdx] = svc.approveQuestionnaire(data.securityQuestionnaires[qIdx]);
      store.write(data);
      return data.securityQuestionnaireReviews[idx];
    },
    rejectReview(id, comments = '') {
      const data = ensureSq(store.read());
      const idx = data.securityQuestionnaireReviews.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.securityQuestionnaireReviews[idx] = svc.rejectReview(data.securityQuestionnaireReviews[idx], comments);
      store.write(data);
      return data.securityQuestionnaireReviews[idx];
    },
    markSent(id) {
      const data = ensureSq(store.read());
      const idx = data.securityQuestionnaires.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.securityQuestionnaires[idx] = svc.markQuestionnaireSent(data.securityQuestionnaires[idx]);
      store.write(data);
      return data.securityQuestionnaires[idx];
    },
    createExport(input) {
      const data = ensureSq(store.read());
      const row = { id: makeId('secqexp'), ...svc.normalizeExportJobInput(input), createdAt: now(), updatedAt: now() };
      data.securityQuestionnaireExports.push(row);
      store.write(data);
      return row;
    },
    startExport(id) {
      const data = ensureSq(store.read());
      const idx = data.securityQuestionnaireExports.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.securityQuestionnaireExports[idx] = svc.startExport(data.securityQuestionnaireExports[idx]);
      store.write(data);
      return data.securityQuestionnaireExports[idx];
    },
    completeExport(id, outputUrl) {
      const data = ensureSq(store.read());
      const idx = data.securityQuestionnaireExports.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.securityQuestionnaireExports[idx] = svc.completeExport(data.securityQuestionnaireExports[idx], outputUrl);
      store.write(data);
      return data.securityQuestionnaireExports[idx];
    },
    metrics(tenantId) {
      const data = ensureSq(store.read());
      return svc.questionnaireMetrics({
        questionnaires: data.securityQuestionnaires.filter(x => !tenantId || x.tenantId === tenantId),
        questions: data.securityQuestionnaireQuestions.filter(x => !tenantId || x.tenantId === tenantId),
        reviews: data.securityQuestionnaireReviews.filter(x => !tenantId || x.tenantId === tenantId),
        exports: data.securityQuestionnaireExports.filter(x => !tenantId || x.tenantId === tenantId)
      });
    }
  };
}

function createPostgresSecurityQuestionnaireRepository() {
  return {
    async listQuestionnaires() { return []; },
    async createQuestionnaire(input) { return { id: 'postgres-questionnaire-placeholder', ...svc.normalizeQuestionnaireInput(input) }; },
    async createQuestion(input) { return { id: 'postgres-question-placeholder', ...svc.normalizeQuestionInput(input) }; },
    async listQuestions() { return []; },
    async approveQuestion() { return null; },
    async rejectQuestion() { return null; },
    async createAnswer(input) { return { id: 'postgres-answer-placeholder', ...svc.normalizeAnswerLibraryInput(input) }; },
    async listAnswers() { return []; },
    async submitForReview() { return null; },
    async createReview(input) { return { id: 'postgres-review-placeholder', ...svc.normalizeReviewInput(input) }; },
    async approveReview() { return null; },
    async rejectReview() { return null; },
    async markSent() { return null; },
    async createExport(input) { return { id: 'postgres-export-placeholder', ...svc.normalizeExportJobInput(input) }; },
    async startExport() { return null; },
    async completeExport() { return null; },
    async metrics() { return svc.questionnaireMetrics({}); }
  };
}

module.exports = { createSecurityQuestionnaireRepository };
