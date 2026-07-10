const fs = require('fs');

const required = [
  'apps/api/src/services/aiGovernanceService.js',
  'apps/api/src/repositories/aiGovernanceRepository.js',
  'apps/api/src/routes/aiGovernance.js',
  'scripts/seed-ai-governance-model-risk.js',
  'packages/database/postgres/133_ai_governance_model_risk.sql',
  'docs/sprint133-ai-governance-model-risk.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 133 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeSystemInput,
  normalizeAssessmentInput,
  normalizeApprovalInput,
  normalizeSignalInput,
  normalizeIncidentInput,
  riskRank,
  deriveRiskTier,
  submitAssessment,
  approveAssessment,
  requireMitigation,
  rejectAssessment,
  approveGate,
  rejectGate,
  activateSystem,
  pauseSystem,
  evaluateSignal,
  mitigateIncident,
  closeIncident,
  reviewSystem,
  aiGovernanceMetrics
} = require('../apps/api/src/services/aiGovernanceService');

let system = normalizeSystemInput({
  tenantId: 'tenant_demo',
  name: 'Eligibility Automation',
  systemType: 'automation',
  userImpact: 'Eligibility decision support',
  dataCategories: ['financial']
});
if (system.code !== 'ELIGIBILITY-AUTOMATION') process.exit(1);
if (deriveRiskTier(system) !== 'high') process.exit(1);
if (riskRank('high') !== 3) process.exit(1);

system = activateSystem({ ...system, riskTier: 'high' });
if (system.status !== 'active') process.exit(1);
system = pauseSystem(system);
if (system.status !== 'paused') process.exit(1);
system = reviewSystem(system, '2026-07-07T00:00:00.000Z');
if (!system.nextReviewAt.startsWith('2027-01-03')) process.exit(1);

let assessment = normalizeAssessmentInput({ aiSystemId: 'sys1', inherentRisk: 'high' });
assessment = submitAssessment(assessment, 'risk');
if (assessment.status !== 'in_review') process.exit(1);
if (approveAssessment(assessment).status !== 'approved') process.exit(1);
if (requireMitigation(assessment).status !== 'requires_mitigation') process.exit(1);
if (rejectAssessment(assessment).status !== 'rejected') process.exit(1);

let approval = normalizeApprovalInput({ assessmentId: 'assess1', approverId: 'risk-lead' });
approval = approveGate(approval, 'ok');
if (approval.status !== 'approved') process.exit(1);
const rejectedGate = rejectGate({ ...approval, status: 'pending' }, 'no');
if (rejectedGate.status !== 'rejected') process.exit(1);

let signal = normalizeSignalInput({ aiSystemId: 'sys1', signalName: 'Override rate', numericValue: 21, warningThreshold: 10, breachThreshold: 20, operator: 'gte' });
signal = evaluateSignal(signal);
if (signal.status !== 'breached') process.exit(1);

let incident = normalizeIncidentInput({ aiSystemId: 'sys1', title: 'Bad recommendation', severity: 'high' });
incident = mitigateIncident(incident);
incident = closeIncident(incident);
if (incident.status !== 'closed') process.exit(1);

const metrics = aiGovernanceMetrics({
  systems: [system],
  assessments: [{ ...assessment, status: 'in_review' }],
  approvals: [{ ...approval, status: 'pending' }],
  signals: [signal],
  incidents: [{ ...incident, status: 'open' }]
});
if (metrics.openAssessments !== 1 || metrics.pendingApprovals !== 1 || metrics.breachedSignals !== 1 || metrics.openIncidents !== 1) process.exit(1);

console.log('Sprint 133 AI governance model risk patch test passed.');
