const fs = require('fs');

const required = [
  'apps/api/src/services/processingInventoryService.js',
  'apps/api/src/repositories/processingInventoryRepository.js',
  'apps/api/src/routes/processingInventory.js',
  'scripts/seed-processing-inventory-dpia.js',
  'packages/database/postgres/131_processing_inventory_dpia.sql',
  'docs/sprint131-processing-inventory-dpia.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 131 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeActivityInput,
  normalizeDataCategoryInput,
  normalizeSystemMappingInput,
  normalizeDpiaInput,
  normalizeDecisionInput,
  normalizeTaskInput,
  riskRank,
  deriveActivityRisk,
  submitDpia,
  approveDpia,
  requireMitigation,
  rejectDpia,
  completeTask,
  reviewActivity,
  isReviewDue,
  inventoryMetrics
} = require('../apps/api/src/services/processingInventoryService');

let activity = normalizeActivityInput({ tenantId: 'tenant_demo', name: 'Support Cases', nextReviewAt: '2026-01-01T00:00:00.000Z' });
if (activity.code !== 'SUPPORT-CASES') process.exit(1);
if (!isReviewDue(activity, '2026-07-07T00:00:00.000Z')) process.exit(1);
activity = reviewActivity(activity, '2026-07-07T00:00:00.000Z');
if (!activity.nextReviewAt.startsWith('2027-07-07')) process.exit(1);

const category = normalizeDataCategoryInput({ activityId: 'act1', name: 'Health Notes', sensitivity: 'special_category', specialCategory: true });
const mapping = normalizeSystemMappingInput({ activityId: 'act1', systemName: 'CRM', region: 'eu-central-1' });
if (deriveActivityRisk([category], [mapping]) !== 'critical') process.exit(1);
if (riskRank('critical') !== 4) process.exit(1);

let dpia = normalizeDpiaInput({ activityId: 'act1', inherentRisk: 'high' });
dpia = submitDpia(dpia);
if (dpia.status !== 'in_review') process.exit(1);
if (approveDpia(dpia).status !== 'approved') process.exit(1);
if (requireMitigation(dpia).status !== 'requires_mitigation') process.exit(1);
if (rejectDpia(dpia).status !== 'rejected') process.exit(1);

const decision = normalizeDecisionInput({ dpiaId: 'dpia1', decidedBy: 'privacy', decisionType: 'approve_with_conditions' });
if (decision.decisionType !== 'approve_with_conditions') process.exit(1);

let task = normalizeTaskInput({ dpiaId: 'dpia1', title: 'Mitigate risk' });
task = completeTask(task);
if (task.status !== 'completed') process.exit(1);

const metrics = inventoryMetrics({ activities: [activity], categories: [category], mappings: [mapping], dpias: [dpia], tasks: [task] });
if (metrics.activeActivities !== 1 || metrics.specialCategoryActivities !== 1 || metrics.activeSystemMappings !== 1) process.exit(1);

console.log('Sprint 131 processing inventory DPIA patch test passed.');
