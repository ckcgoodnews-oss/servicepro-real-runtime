const { makeId, now } = require('../services/id');
const svc = require('../services/trainingAwarenessService');

function createTrainingAwarenessRepository(store) {
  if (store.type === 'json') return createJsonTrainingAwarenessRepository(store);
  if (store.type === 'postgres') return createPostgresTrainingAwarenessRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureTraining(data) {
  data.trainingCourses ||= [];
  data.trainingCampaigns ||= [];
  data.trainingAssignments ||= [];
  data.trainingEvidence ||= [];
  data.trainingReminders ||= [];
  data.trainingExceptions ||= [];
  return data;
}

function createJsonTrainingAwarenessRepository(store) {
  return {
    listCourses(filters = {}) {
      return ensureTraining(store.read()).trainingCourses
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.courseType || x.courseType === filters.courseType)
        .sort((a, b) => String(a.title).localeCompare(String(b.title)));
    },
    createCourse(input) {
      const data = ensureTraining(store.read());
      const row = { id: makeId('course'), ...svc.normalizeCourseInput(input), createdAt: now(), updatedAt: now() };
      data.trainingCourses.push(row);
      store.write(data);
      return row;
    },
    createCampaign(input) {
      const data = ensureTraining(store.read());
      const row = { id: makeId('campaign'), ...svc.normalizeCampaignInput(input), createdAt: now(), updatedAt: now() };
      data.trainingCampaigns.push(row);
      store.write(data);
      return row;
    },
    listCampaigns(filters = {}) {
      return ensureTraining(store.read()).trainingCampaigns
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.startsAt).localeCompare(String(a.startsAt)));
    },
    scheduleCampaign(id, startsAt, dueAt) {
      const data = ensureTraining(store.read());
      const idx = data.trainingCampaigns.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.trainingCampaigns[idx] = svc.scheduleCampaign(data.trainingCampaigns[idx], startsAt, dueAt);
      store.write(data);
      return data.trainingCampaigns[idx];
    },
    activateCampaign(id) {
      const data = ensureTraining(store.read());
      const idx = data.trainingCampaigns.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.trainingCampaigns[idx] = svc.activateCampaign(data.trainingCampaigns[idx]);
      store.write(data);
      return data.trainingCampaigns[idx];
    },
    createAssignment(input) {
      const data = ensureTraining(store.read());
      const row = { id: makeId('assign'), ...svc.normalizeAssignmentInput(input), createdAt: now(), updatedAt: now() };
      data.trainingAssignments.push(row);
      store.write(data);
      return row;
    },
    listAssignments(filters = {}) {
      return ensureTraining(store.read()).trainingAssignments
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.campaignId || x.campaignId === filters.campaignId)
        .filter(x => !filters.courseId || x.courseId === filters.courseId)
        .filter(x => !filters.subjectId || x.subjectId === filters.subjectId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)));
    },
    startAssignment(id) {
      const data = ensureTraining(store.read());
      const idx = data.trainingAssignments.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.trainingAssignments[idx] = svc.startAssignment(data.trainingAssignments[idx]);
      store.write(data);
      return data.trainingAssignments[idx];
    },
    createEvidence(input) {
      const data = ensureTraining(store.read());
      const row = { id: makeId('evidence'), ...svc.normalizeEvidenceInput(input), createdAt: now(), updatedAt: now() };
      data.trainingEvidence.push(row);
      const aidx = data.trainingAssignments.findIndex(x => x.id === row.assignmentId);
      const assignment = data.trainingAssignments[aidx];
      const course = assignment && data.trainingCourses.find(x => x.id === assignment.courseId);
      if (aidx !== -1 && course && svc.evidencePassesCourse(row, course)) {
        data.trainingAssignments[aidx] = svc.completeAssignment(data.trainingAssignments[aidx], row.score);
      }
      store.write(data);
      return row;
    },
    completeAssignment(id, score = null) {
      const data = ensureTraining(store.read());
      const idx = data.trainingAssignments.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.trainingAssignments[idx] = svc.completeAssignment(data.trainingAssignments[idx], score);
      store.write(data);
      return data.trainingAssignments[idx];
    },
    markOverdue(asOf = new Date().toISOString()) {
      const data = ensureTraining(store.read());
      data.trainingAssignments = data.trainingAssignments.map(x => svc.markAssignmentOverdue(x, asOf));
      store.write(data);
      return data.trainingAssignments.filter(x => x.status === 'overdue');
    },
    createReminder(input) {
      const data = ensureTraining(store.read());
      const row = { id: makeId('trrem'), ...svc.normalizeReminderInput(input), createdAt: now(), updatedAt: now() };
      data.trainingReminders.push(row);
      store.write(data);
      return row;
    },
    sendReminder(id) {
      const data = ensureTraining(store.read());
      const idx = data.trainingReminders.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.trainingReminders[idx] = svc.sendReminder(data.trainingReminders[idx]);
      store.write(data);
      return data.trainingReminders[idx];
    },
    failReminder(id, reason = '') {
      const data = ensureTraining(store.read());
      const idx = data.trainingReminders.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.trainingReminders[idx] = svc.failReminder(data.trainingReminders[idx], reason);
      store.write(data);
      return data.trainingReminders[idx];
    },
    createException(input) {
      const data = ensureTraining(store.read());
      const row = { id: makeId('trex'), ...svc.normalizeExceptionInput(input), createdAt: now(), updatedAt: now() };
      data.trainingExceptions.push(row);
      store.write(data);
      return row;
    },
    approveException(id, decidedBy) {
      const data = ensureTraining(store.read());
      const idx = data.trainingExceptions.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.trainingExceptions[idx] = svc.approveException(data.trainingExceptions[idx], decidedBy);
      const aidx = data.trainingAssignments.findIndex(x => x.id === data.trainingExceptions[idx].assignmentId);
      if (aidx !== -1) data.trainingAssignments[aidx] = svc.waiveAssignment(data.trainingAssignments[aidx], data.trainingExceptions[idx].reason);
      store.write(data);
      return data.trainingExceptions[idx];
    },
    rejectException(id, decidedBy) {
      const data = ensureTraining(store.read());
      const idx = data.trainingExceptions.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.trainingExceptions[idx] = svc.rejectException(data.trainingExceptions[idx], decidedBy);
      store.write(data);
      return data.trainingExceptions[idx];
    },
    metrics(tenantId) {
      const data = ensureTraining(store.read());
      return svc.trainingMetrics({
        courses: data.trainingCourses.filter(x => !tenantId || x.tenantId === tenantId),
        campaigns: data.trainingCampaigns.filter(x => !tenantId || x.tenantId === tenantId),
        assignments: data.trainingAssignments.filter(x => !tenantId || x.tenantId === tenantId),
        reminders: data.trainingReminders.filter(x => !tenantId || x.tenantId === tenantId),
        exceptions: data.trainingExceptions.filter(x => !tenantId || x.tenantId === tenantId)
      });
    }
  };
}

function createPostgresTrainingAwarenessRepository() {
  return {
    async listCourses() { return []; },
    async createCourse(input) { return { id: 'postgres-course-placeholder', ...svc.normalizeCourseInput(input) }; },
    async createCampaign(input) { return { id: 'postgres-campaign-placeholder', ...svc.normalizeCampaignInput(input) }; },
    async listCampaigns() { return []; },
    async scheduleCampaign() { return null; },
    async activateCampaign() { return null; },
    async createAssignment(input) { return { id: 'postgres-assignment-placeholder', ...svc.normalizeAssignmentInput(input) }; },
    async listAssignments() { return []; },
    async startAssignment() { return null; },
    async createEvidence(input) { return { id: 'postgres-evidence-placeholder', ...svc.normalizeEvidenceInput(input) }; },
    async completeAssignment() { return null; },
    async markOverdue() { return []; },
    async createReminder(input) { return { id: 'postgres-reminder-placeholder', ...svc.normalizeReminderInput(input) }; },
    async sendReminder() { return null; },
    async failReminder() { return null; },
    async createException(input) { return { id: 'postgres-exception-placeholder', ...svc.normalizeExceptionInput(input) }; },
    async approveException() { return null; },
    async rejectException() { return null; },
    async metrics() { return svc.trainingMetrics({}); }
  };
}

module.exports = { createTrainingAwarenessRepository };
