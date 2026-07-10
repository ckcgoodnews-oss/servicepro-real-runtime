const fs = require('fs');

const required = [
  'apps/api/src/services/privacyBreachService.js',
  'apps/api/src/repositories/privacyBreachRepository.js',
  'apps/api/src/routes/privacyBreach.js',
  'scripts/seed-privacy-breach-notifications.js',
  'packages/database/postgres/132_privacy_breach_notifications.sql',
  'docs/sprint132-privacy-breach-notifications.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 132 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeIncidentInput,
  normalizeAssessmentInput,
  normalizeObligationInput,
  normalizeNoticeInput,
  normalizeEvidenceInput,
  transitionIncident,
  assessBreachRisk,
  recommendDecision,
  submitAssessment,
  approveAssessment,
  rejectAssessment,
  regulatorDueAt,
  subjectNoticeDueAt,
  completeObligation,
  waiveObligation,
  markObligationOverdue,
  approveNotice,
  sendNotice,
  failNotice,
  breachMetrics
} = require('../apps/api/src/services/privacyBreachService');

let incident = normalizeIncidentInput({
  tenantId: 'tenant_demo',
  title: 'Credential exposure',
  severity: 'critical',
  affectedSubjects: 10,
  affectedDataTypes: ['credentials'],
  discoveredAt: '2026-07-07T00:00:00.000Z'
});
if (assessBreachRisk(incident) !== 'high') process.exit(1);
if (recommendDecision(incident, {}) !== 'breach_notification_required') process.exit(1);
incident = transitionIncident(incident, 'contained', '2026-07-07T01:00:00.000Z');
if (incident.status !== 'contained' || !incident.containedAt) process.exit(1);

let assessment = normalizeAssessmentInput({ incidentId: 'inc1', riskOfHarm: 'high' });
assessment = submitAssessment(assessment, 'privacy');
assessment = approveAssessment(assessment);
if (assessment.status !== 'approved') process.exit(1);
if (rejectAssessment({ ...assessment, status: 'in_review' }).status !== 'rejected') process.exit(1);

if (regulatorDueAt('2026-07-07T00:00:00.000Z') !== '2026-07-10T00:00:00.000Z') process.exit(1);
if (!subjectNoticeDueAt('2026-07-07T00:00:00.000Z').startsWith('2026-08-06')) process.exit(1);

let obligation = normalizeObligationInput({ incidentId: 'inc1', noticeType: 'regulator', dueAt: '2026-07-08T00:00:00.000Z' });
obligation = markObligationOverdue(obligation, '2026-07-09T00:00:00.000Z');
if (obligation.status !== 'overdue') process.exit(1);
obligation = completeObligation(obligation);
if (obligation.status !== 'completed') process.exit(1);
const waived = waiveObligation(normalizeObligationInput({ incidentId: 'inc1', noticeType: 'customer' }), 'not required');
if (waived.status !== 'waived') process.exit(1);

let notice = normalizeNoticeInput({ incidentId: 'inc1', noticeType: 'regulator', subject: 'Notice', body: 'Body' });
notice = approveNotice(notice, 'privacy');
notice = sendNotice(notice);
if (notice.status !== 'sent') process.exit(1);
const failed = failNotice(normalizeNoticeInput({ incidentId: 'inc1', noticeType: 'customer' }), 'smtp');
if (failed.status !== 'failed') process.exit(1);

const evidence = normalizeEvidenceInput({ incidentId: 'inc1', title: 'Timeline' });
if (evidence.title !== 'Timeline') process.exit(1);

const metrics = breachMetrics({ incidents: [incident], assessments: [assessment], obligations: [obligation], notices: [notice], evidence: [evidence] });
if (metrics.approvedAssessments !== 1 || metrics.sentNotices !== 1 || metrics.evidenceItems !== 1) process.exit(1);

console.log('Sprint 132 privacy breach notifications patch test passed.');
