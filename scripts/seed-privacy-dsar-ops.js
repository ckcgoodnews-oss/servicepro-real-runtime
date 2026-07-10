const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';
  const subjectId = 'customer.user@example.com';

  const dsar = await repos.privacyDsarOps.createDsar({ tenantId, subjectId, subjectEmail: subjectId, requestType: 'access', jurisdiction: 'US-IN', assignedTo: 'privacy' });
  const verifiedDsar = await repos.privacyDsarOps.verifyDsarIdentity(dsar.id);
  const fulfilledDsar = await repos.privacyDsarOps.fulfillDsar(dsar.id, 'Export delivered securely.');

  const consent = await repos.privacyDsarOps.createConsent({ tenantId, subjectId, purpose: 'marketing_email', source: 'signup_form', policyVersion: '2026-07' });
  const withdrawnConsent = await repos.privacyDsarOps.withdrawConsent(consent.id);

  const retention = await repos.privacyDsarOps.createRetentionPolicy({ tenantId, name: 'Support Ticket Retention', dataCategory: 'support_ticket', retentionDays: 730, legalBasis: 'legitimate_interest', owner: 'privacy' });
  const activeRetention = await repos.privacyDsarOps.activateRetentionPolicy(retention.id);

  const deletionJob = await repos.privacyDsarOps.createDeletionJob({ tenantId, subjectId, requestId: dsar.id, scope: 'subject' });
  const runningDeletion = await repos.privacyDsarOps.startDeletionJob(deletionJob.id);
  const completedDeletion = await repos.privacyDsarOps.completeDeletionJob(deletionJob.id, 12);

  const activity = await repos.privacyDsarOps.createProcessingActivity({ tenantId, name: 'Customer Account Management', dataCategories: ['account', 'billing'], subjectCategories: ['customer_admin'], legalBasis: 'contract', riskLevel: 'medium', owner: 'privacy' });
  const activeActivity = await repos.privacyDsarOps.activateProcessingActivity(activity.id);

  const dpia = await repos.privacyDsarOps.createDpia({ tenantId, processingActivityId: activity.id, riskLevel: 'medium' });
  const reviewedDpia = await repos.privacyDsarOps.submitDpiaForReview(dpia.id, 'privacy', 'Standard account management processing.');
  const approvedDpia = await repos.privacyDsarOps.approveDpia(dpia.id, 'dpo');

  const breach = await repos.privacyDsarOps.createBreach({ tenantId, title: 'Demo suspected privacy event', riskLevel: 'low', affectedSubjectCount: 1 });
  const confirmedBreach = await repos.privacyDsarOps.confirmBreach(breach.id);
  const reportedBreach = await repos.privacyDsarOps.reportBreach(breach.id, 'REG-DEMO-001');
  const subjectNotice = await repos.privacyDsarOps.notifySubjects(breach.id);
  const closedBreach = await repos.privacyDsarOps.closeBreach(breach.id);

  const metrics = await repos.privacyDsarOps.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, dsar: fulfilledDsar, verifiedDsar, consent: withdrawnConsent, retention: activeRetention, deletion: completedDeletion, runningDeletion, activity: activeActivity, dpia: approvedDpia, reviewedDpia, breach: closedBreach, confirmedBreach, reportedBreach, subjectNotice, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
