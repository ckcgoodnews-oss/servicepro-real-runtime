const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const bia = await repos.bcdrGovernance.createBia({
    tenantId,
    processName: 'Customer Support Operations',
    criticality: 'high',
    owner: 'operations',
    businessUnit: 'support',
    rtoHours: 4,
    rpoHours: 1,
    dependencies: ['support-portal', 'ticket-db'],
    impactSummary: 'Customer support outage delays field service response.'
  });
  const submittedBia = await repos.bcdrGovernance.submitBia(bia.id);
  const approvedBia = await repos.bcdrGovernance.approveBia(bia.id);

  const plan = await repos.bcdrGovernance.createPlan({
    biaId: bia.id,
    tenantId,
    title: 'Customer Support Recovery Plan',
    owner: 'platform',
    recoveryStrategy: 'Restore support portal from warm standby and latest database snapshot.',
    rtoHours: 4,
    rpoHours: 1
  });
  const submittedPlan = await repos.bcdrGovernance.submitPlan(plan.id);

  const approval = await repos.bcdrGovernance.createApproval({
    planId: plan.id,
    biaId: bia.id,
    tenantId,
    approverId: 'ops-lead',
    approverName: 'Operations Lead'
  });
  const approvedGate = await repos.bcdrGovernance.approveGate(approval.id, 'Plan approved.');

  const approvedPlan = await repos.bcdrGovernance.approvePlan(plan.id);
  const activePlan = await repos.bcdrGovernance.activatePlan(plan.id);

  const exercise = await repos.bcdrGovernance.createExercise({
    planId: plan.id,
    biaId: bia.id,
    tenantId,
    name: 'Support Portal Restore Test',
    exerciseType: 'restore_test',
    owner: 'platform'
  });
  const running = await repos.bcdrGovernance.startExercise(exercise.id);
  const completedExercise = await repos.bcdrGovernance.completeExercise(exercise.id, 3.5, 0.5, 'Restore completed within target.');

  const evidence = await repos.bcdrGovernance.createEvidence({
    exerciseId: exercise.id,
    planId: plan.id,
    tenantId,
    evidenceType: 'report',
    title: 'Restore test report',
    fileUrl: 's3://bcdr/evidence/support-restore-report.pdf',
    collectedBy: 'platform'
  });

  const gap = await repos.bcdrGovernance.createGap({
    planId: plan.id,
    exerciseId: exercise.id,
    tenantId,
    title: 'Runbook screenshot outdated',
    severity: 'medium',
    owner: 'platform'
  });
  const completedGap = await repos.bcdrGovernance.completeGap(gap.id);

  const metrics = await repos.bcdrGovernance.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({
    ok: true,
    bia: approvedBia,
    submittedBia,
    plan: activePlan,
    submittedPlan,
    approvedPlan,
    approval: approvedGate,
    exercise: completedExercise,
    running,
    evidence,
    gap: completedGap,
    metrics
  }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
