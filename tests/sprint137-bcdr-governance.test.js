const fs = require('fs');

const required = [
  'apps/api/src/services/bcdrGovernanceService.js',
  'apps/api/src/repositories/bcdrGovernanceRepository.js',
  'apps/api/src/routes/bcdrGovernance.js',
  'scripts/seed-bcdr-governance.js',
  'packages/database/postgres/137_bcdr_governance.sql',
  'docs/sprint137-bcdr-governance.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 137 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeBiaInput,
  normalizePlanInput,
  normalizeApprovalInput,
  normalizeExerciseInput,
  normalizeEvidenceInput,
  normalizeGapInput,
  submitBia,
  approveBia,
  submitPlan,
  approvePlan,
  activatePlan,
  approveGate,
  rejectGate,
  startExercise,
  completeExercise,
  failExercise,
  exerciseMetTargets,
  applyExerciseToPlan,
  completeGap,
  acceptGapRisk,
  bcdrMetrics
} = require('../apps/api/src/services/bcdrGovernanceService');

let bia = normalizeBiaInput({ tenantId: 'tenant_demo', processName: 'Support Ops', criticality: 'high', rtoHours: 4, rpoHours: 1 });
if (bia.code !== 'SUPPORT-OPS') process.exit(1);
bia = submitBia(bia);
bia = approveBia(bia);
if (bia.status !== 'approved') process.exit(1);

let plan = normalizePlanInput({ biaId: 'bia1', title: 'Support Recovery', rtoHours: 4, rpoHours: 1 });
plan = submitPlan(plan);
if (plan.status !== 'in_review') process.exit(1);
plan = approvePlan(plan);
plan = activatePlan(plan);
if (plan.status !== 'active') process.exit(1);

let approval = normalizeApprovalInput({ planId: 'plan1', approverId: 'ops' });
approval = approveGate(approval, 'ok');
if (approval.status !== 'approved') process.exit(1);
if (rejectGate({ ...approval, status: 'pending' }, 'no').status !== 'rejected') process.exit(1);

let exercise = normalizeExerciseInput({ planId: 'plan1', name: 'Restore Test', exerciseType: 'restore_test' });
exercise = startExercise(exercise);
exercise = completeExercise(exercise, 3.5, 0.5, 'ok', '2026-07-07T00:00:00.000Z');
if (!exerciseMetTargets(exercise, plan)) process.exit(1);
if (failExercise({ ...exercise, status: 'running' }, 'bad').status !== 'failed') process.exit(1);
plan = applyExerciseToPlan(plan, exercise);
if (!plan.nextTestAt.startsWith('2027-01-03')) process.exit(1);

const evidence = normalizeEvidenceInput({ exerciseId: 'ex1', title: 'Report', evidenceType: 'report' });
if (evidence.title !== 'Report') process.exit(1);

let gap = normalizeGapInput({ planId: 'plan1', title: 'Missing runbook', severity: 'critical' });
gap = completeGap(gap);
if (gap.status !== 'completed') process.exit(1);
const accepted = acceptGapRisk({ ...gap, status: 'open' }, 'low likelihood');
if (accepted.status !== 'accepted_risk') process.exit(1);

const metrics = bcdrMetrics({ bias: [bia], plans: [plan], approvals: [approval], exercises: [exercise], gaps: [{ ...gap, status: 'open', severity: 'critical' }] });
if (metrics.approvedBias !== 1 || metrics.activePlans !== 1 || metrics.completedExercises !== 1 || metrics.criticalGaps !== 1) process.exit(1);

console.log('Sprint 137 BCDR governance patch test passed.');
