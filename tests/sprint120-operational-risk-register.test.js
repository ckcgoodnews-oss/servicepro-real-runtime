const fs = require('fs');

const required = [
  'apps/api/src/services/operationalRiskService.js',
  'apps/api/src/repositories/operationalRiskRepository.js',
  'apps/api/src/routes/operationalRisks.js',
  'scripts/seed-operational-risk-register.js',
  'packages/database/postgres/120_operational_risk_register.sql',
  'docs/sprint120-operational-risk-register.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 120 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeRiskInput,
  normalizeMitigationPlanInput,
  normalizeKriInput,
  normalizeReviewInput,
  normalizeAcceptanceInput,
  riskScore,
  riskLevel,
  evaluateKri,
  completeMitigationPlan,
  applyMitigationToRisk,
  completeReview,
  applyReviewToRisk,
  approveAcceptance,
  rejectAcceptance,
  closeRisk,
  isAcceptanceActive,
  riskMetrics
} = require('../apps/api/src/services/operationalRiskService');

let risk = normalizeRiskInput({ tenantId: 'tenant_demo', title: 'Access process risk', inherentLikelihood: 4, inherentImpact: 5, residualLikelihood: 3, residualImpact: 4 });
if (risk.inherentLevel !== 'critical' || risk.residualLevel !== 'high') process.exit(1);
if (riskScore(2, 3) !== 6 || riskLevel(20) !== 'critical') process.exit(1);

let plan = normalizeMitigationPlanInput({ riskId: 'risk1', title: 'Automate review', expectedResidualLikelihood: 2, expectedResidualImpact: 3 });
plan = completeMitigationPlan(plan);
risk = applyMitigationToRisk(risk, plan);
if (risk.residualScore !== 6 || risk.residualLevel !== 'medium') process.exit(1);

let kri = normalizeKriInput({ riskId: 'risk1', name: 'Overdue reviews', currentValue: 3, warningThreshold: 1, breachThreshold: 2, operator: 'gte' });
kri = evaluateKri(kri);
if (kri.status !== 'breached') process.exit(1);

let review = normalizeReviewInput({ riskId: 'risk1', reviewer: 'risk', residualLikelihood: 1, residualImpact: 2 });
review = completeReview(review, 'Reviewed');
risk = applyReviewToRisk(risk, review);
if (risk.residualScore !== 2 || risk.residualLevel !== 'low') process.exit(1);

let acceptance = normalizeAcceptanceInput({ riskId: 'risk1', reason: 'Accept residual', expiresAt: '2026-12-31T00:00:00.000Z' });
acceptance = approveAcceptance(acceptance, 'committee');
if (!isAcceptanceActive(acceptance, '2026-08-01T00:00:00.000Z')) process.exit(1);
acceptance = rejectAcceptance({ ...acceptance, status: 'pending' }, 'committee');
if (acceptance.status !== 'rejected') process.exit(1);

risk = closeRisk(risk);
if (risk.status !== 'closed') process.exit(1);

const metrics = riskMetrics([risk, { ...risk, status: 'active', residualLevel: 'critical' }], [kri]);
if (metrics.totalRisks !== 2 || metrics.criticalRisks !== 1 || metrics.breachedKris !== 1) process.exit(1);

console.log('Sprint 120 operational risk register patch test passed.');
