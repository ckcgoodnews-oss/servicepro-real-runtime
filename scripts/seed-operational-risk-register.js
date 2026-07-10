const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const risk = await repos.operationalRisks.createRisk({
    tenantId,
    title: 'Privileged access process failure',
    category: 'security',
    owner: 'security',
    businessUnit: 'technology',
    inherentLikelihood: 4,
    inherentImpact: 5,
    residualLikelihood: 3,
    residualImpact: 4
  });

  const plan = await repos.operationalRisks.createMitigationPlan({
    riskId: risk.id,
    tenantId,
    title: 'Automate privileged access review',
    owner: 'iam-owner',
    expectedResidualLikelihood: 2,
    expectedResidualImpact: 3
  });
  const completedPlan = await repos.operationalRisks.completeMitigationPlan(plan.id);

  const kri = await repos.operationalRisks.createKri({
    riskId: risk.id,
    tenantId,
    name: 'Overdue privileged reviews',
    currentValue: 3,
    warningThreshold: 1,
    breachThreshold: 2,
    operator: 'gte'
  });

  const review = await repos.operationalRisks.createReview({
    riskId: risk.id,
    tenantId,
    reviewer: 'risk-manager',
    residualLikelihood: 2,
    residualImpact: 3
  });
  const completedReview = await repos.operationalRisks.completeReview(review.id, 'Residual score reduced after automation.');

  const acceptance = await repos.operationalRisks.createAcceptance({
    riskId: risk.id,
    tenantId,
    reason: 'Accept residual risk through next review cycle.',
    requestedBy: 'risk-owner',
    expiresAt: '2026-12-31T00:00:00.000Z'
  });
  const approvedAcceptance = await repos.operationalRisks.approveAcceptance(acceptance.id, 'risk-committee');

  const metrics = await repos.operationalRisks.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, risk, plan: completedPlan, kri, review: completedReview, acceptance: approvedAcceptance, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
