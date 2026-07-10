const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const plan = await repos.customerSuccess.createAccountPlan({
    tenantId,
    accountName: 'Demo Field Service Co.',
    successManager: 'Customer Success Lead',
    executiveSponsor: 'VP Operations',
    healthScore: 72,
    renewalDate: '2027-01-31',
    goals: ['Increase mobile adoption', 'Reduce dispatch cycle time']
  });

  const milestone = await repos.customerSuccess.createMilestone({
    accountPlanId: plan.id,
    name: 'Mobile go-live',
    description: 'All technicians live on mobile app.',
    status: 'in_progress',
    weight: 3,
    owner: 'Customer Success Lead'
  });

  const completedMilestone = await repos.customerSuccess.completeMilestone(milestone.id);

  const task = await repos.customerSuccess.createTask({
    accountPlanId: plan.id,
    title: 'Schedule dispatcher adoption workshop',
    priority: 'high',
    owner: 'Customer Success Lead'
  });

  const qbr = await repos.customerSuccess.createQbr({
    accountPlanId: plan.id,
    title: 'Q3 Business Review',
    scheduledAt: '2026-09-15T14:00:00.000Z',
    attendees: ['VP Operations', 'Customer Success Lead'],
    agenda: ['Adoption review', 'Renewal plan']
  });

  const risk = await repos.customerSuccess.createRenewalRisk({
    accountPlanId: plan.id,
    riskLevel: 'medium',
    reason: 'Mobile adoption below target',
    mitigationPlan: 'Weekly adoption coaching',
    owner: 'Customer Success Lead'
  });

  const score = await repos.customerSuccess.score(plan.id);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, plan, milestone: completedMilestone, task, qbr, risk, score }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
