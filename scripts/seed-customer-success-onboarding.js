const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';
  const customerTenantId = 'tenant_customer_demo';

  const cohort = await repos.customerSuccessOnboarding.createCohort({ tenantId, name: 'July 2026 Launch Cohort', launchDate: '2026-07-10', owner: 'customer-success', customerTenantIds: [customerTenantId] });
  const activeCohort = await repos.customerSuccessOnboarding.activateCohort(cohort.id);

  const plan = await repos.customerSuccessOnboarding.createPlan({ tenantId, customerTenantId, cohortId: cohort.id, customerName: 'Demo Services LLC', owner: 'csm' });
  const startedPlan = await repos.customerSuccessOnboarding.startPlan(plan.id);

  const task1 = await repos.customerSuccessOnboarding.createTask({ tenantId, planId: plan.id, title: 'Configure customer domain', sequence: 1, owner: 'implementation' });
  await repos.customerSuccessOnboarding.startTask(task1.id);
  const completedTask = await repos.customerSuccessOnboarding.completeTask(task1.id);

  const metric = await repos.customerSuccessOnboarding.createMetric({ tenantId, customerTenantId, metricName: 'weekly_active_users', metricValue: 18, targetValue: 20, period: 'weekly' });

  const feedback = await repos.customerSuccessOnboarding.createFeedback({ tenantId, customerTenantId, feedbackType: 'feature_request', summary: 'Customer wants dashboard branding controls.', severity: 'medium', submittedBy: 'admin@example.com' });
  await repos.customerSuccessOnboarding.reviewFeedback(feedback.id, 'product');
  const resolvedFeedback = await repos.customerSuccessOnboarding.resolveFeedback(feedback.id, 'Added to roadmap.');

  const escalation = await repos.customerSuccessOnboarding.createEscalation({ tenantId, customerTenantId, title: 'Email delivery delay', severity: 'high', owner: 'support' });
  await repos.customerSuccessOnboarding.startEscalation(escalation.id, 'support-lead');
  const resolvedEscalation = await repos.customerSuccessOnboarding.resolveEscalation(escalation.id, 'SMTP retry configuration corrected.');
  const closedEscalation = await repos.customerSuccessOnboarding.closeEscalation(escalation.id);

  const successPlan = await repos.customerSuccessOnboarding.createSuccessPlan({ tenantId, customerTenantId, owner: 'csm', objectives: ['Launch customer site', 'Reach 20 weekly active users'] });
  const activeSuccessPlan = await repos.customerSuccessOnboarding.activateSuccessPlan(successPlan.id);

  const completedPlan = await repos.customerSuccessOnboarding.completePlan(plan.id);
  const metrics = await repos.customerSuccessOnboarding.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, cohort: activeCohort, plan: completedPlan, startedPlan, task: completedTask, metric, feedback: resolvedFeedback, escalation: closedEscalation, resolvedEscalation, successPlan: activeSuccessPlan, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
