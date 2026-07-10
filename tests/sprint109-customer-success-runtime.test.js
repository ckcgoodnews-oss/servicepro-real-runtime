const fs = require('fs');

const required = [
  'apps/api/src/services/customerSuccessService.js',
  'apps/api/src/repositories/customerSuccessRepository.js',
  'apps/api/src/routes/customerSuccess.js',
  'scripts/seed-customer-success.js',
  'packages/database/postgres/109_customer_success_runtime.sql',
  'docs/sprint109-customer-success-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 109 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeAccountPlanInput,
  normalizeMilestoneInput,
  normalizeSuccessTaskInput,
  normalizeQbrInput,
  normalizeRenewalRiskInput,
  completeMilestone,
  completeTask,
  completeQbr,
  resolveRenewalRisk,
  calculateAdoptionScore,
  calculateRenewalRisk
} = require('../apps/api/src/services/customerSuccessService');

const plan = normalizeAccountPlanInput({ tenantId: 'tenant_demo', accountName: 'Demo Co.', healthScore: 45 });
if (plan.status !== 'active' || plan.healthScore !== 45) process.exit(1);

let milestone = normalizeMilestoneInput({ accountPlanId: 'plan1', name: 'Go live', weight: 2 });
milestone = completeMilestone(milestone);
if (milestone.status !== 'completed') process.exit(1);

let task = normalizeSuccessTaskInput({ accountPlanId: 'plan1', title: 'Train dispatchers', priority: 'high' });
task = completeTask(task);
if (task.status !== 'completed') process.exit(1);

let qbr = normalizeQbrInput({ accountPlanId: 'plan1', title: 'QBR' });
qbr = completeQbr(qbr, ['Approved rollout plan']);
if (qbr.status !== 'completed' || qbr.outcomes.length !== 1) process.exit(1);

let risk = normalizeRenewalRiskInput({ accountPlanId: 'plan1', riskLevel: 'high', reason: 'Low adoption' });
const openRisk = risk;
risk = resolveRenewalRisk(risk);
if (!risk.resolvedAt) process.exit(1);

const adoption = calculateAdoptionScore({ milestones: [milestone], tasks: [task] });
if (adoption.score !== 100 || adoption.status !== 'strong') process.exit(1);

const renewal = calculateRenewalRisk({ accountPlan: plan, risks: [openRisk], adoptionScore: 30 });
if (renewal.riskLevel !== 'high') process.exit(1);

console.log('Sprint 109 customer success runtime patch test passed.');
