const fs = require('fs');
const required = ['apps/api/src/services/privacyDsarOpsService.js','apps/api/src/repositories/privacyDsarOpsRepository.js','apps/api/src/routes/privacyDsarOps.js','scripts/seed-privacy-dsar-ops.js','packages/database/postgres/151_privacy_dsar_ops.sql','docs/sprint151-privacy-dsar-ops.md'];
for (const file of required) { if (!fs.existsSync(file)) { console.error(`Missing required Sprint 151 patch file: ${file}`); process.exit(1); } }
const svc = require('../apps/api/src/services/privacyDsarOpsService');

let dsar = svc.normalizeDsarInput({ tenantId: 'tenant_demo', subjectId: 'User@Example.com', requestType: 'access' });
if (dsar.subjectId !== 'user@example.com') process.exit(1);
dsar = svc.fulfillDsar(svc.verifyDsarIdentity(dsar), 'done');
if (dsar.status !== 'fulfilled') process.exit(1);

let denied = svc.denyDsar(svc.normalizeDsarInput({ tenantId: 'tenant_demo', subjectId: 'u2', requestType: 'delete' }), 'legal hold');
if (denied.status !== 'denied') process.exit(1);

let consent = svc.withdrawConsent(svc.normalizeConsentInput({ tenantId: 'tenant_demo', subjectId: 'u1', purpose: 'marketing' }));
if (consent.status !== 'withdrawn') process.exit(1);

let policy = svc.activateRetentionPolicy(svc.normalizeRetentionPolicyInput({ tenantId: 'tenant_demo', name: 'Support Retention', dataCategory: 'support' }));
if (policy.status !== 'active') process.exit(1);

let deletion = svc.completeDeletionJob(svc.startDeletionJob(svc.normalizeDeletionJobInput({ tenantId: 'tenant_demo', subjectId: 'u1' })), 7);
if (deletion.status !== 'completed' || deletion.recordsDeleted !== 7) process.exit(1);

let activity = svc.activateProcessingActivity(svc.normalizeProcessingActivityInput({ tenantId: 'tenant_demo', name: 'Account Processing', riskLevel: 'medium' }));
if (activity.status !== 'active') process.exit(1);

let dpia = svc.approveDpia(svc.submitDpiaForReview(svc.normalizeDpiaInput({ tenantId: 'tenant_demo', processingActivityId: 'activity1' }), 'privacy', 'ok'), 'dpo');
if (dpia.status !== 'approved') process.exit(1);
if (svc.rejectDpia(svc.normalizeDpiaInput({ tenantId: 'tenant_demo', processingActivityId: 'activity1' }), 'dpo', 'bad').status !== 'rejected') process.exit(1);

let breach = svc.closeBreach(svc.notifySubjects(svc.reportBreach(svc.confirmBreach(svc.normalizeBreachNotificationInput({ tenantId: 'tenant_demo', title: 'Privacy event', riskLevel: 'high' })), 'REG-1')));
if (breach.status !== 'closed') process.exit(1);

const overdueDsar = svc.normalizeDsarInput({ tenantId: 'tenant_demo', subjectId: 'late', dueAt: '2020-01-01T00:00:00.000Z' });
if (!svc.dsarOverdue(overdueDsar, '2026-01-01T00:00:00.000Z')) process.exit(1);

const metrics = svc.privacyMetrics({ dsars: [overdueDsar], consents: [svc.normalizeConsentInput({ tenantId: 'tenant_demo', subjectId: 'u3', purpose: 'email' })], policies: [policy], deletionJobs: [deletion], activities: [activity], dpias: [dpia], breaches: [svc.reportBreach(svc.confirmBreach(svc.normalizeBreachNotificationInput({ tenantId: 'tenant_demo', title: 'B2' })), 'R2')] });
if (metrics.openDsars !== 1 || metrics.overdueDsars !== 1 || metrics.activeConsents !== 1 || metrics.activeRetentionPolicies !== 1 || metrics.completedDeletionJobs !== 1 || metrics.activeProcessingActivities !== 1 || metrics.approvedDpias !== 1 || metrics.reportedBreaches !== 1) process.exit(1);
console.log('Sprint 151 privacy DSAR ops patch test passed.');
