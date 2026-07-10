const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const activity = await repos.processingInventory.createActivity({
    tenantId,
    name: 'Customer Support Case Management',
    owner: 'privacy',
    businessUnit: 'support',
    purpose: 'Provide customer support and resolve service issues.',
    lawfulBasis: 'contract',
    dataSubjectTypes: ['customer']
  });

  const category = await repos.processingInventory.createDataCategory({
    activityId: activity.id,
    tenantId,
    name: 'Customer Contact Data',
    sensitivity: 'confidential',
    dataSubjectType: 'customer',
    fields: ['name', 'email', 'phone']
  });

  const mapping = await repos.processingInventory.createSystemMapping({
    activityId: activity.id,
    tenantId,
    systemName: 'ServicePro Support',
    systemOwner: 'support-ops',
    processingRole: 'controller',
    region: 'us-east-2'
  });

  const dpia = await repos.processingInventory.createDpia({
    activityId: activity.id,
    tenantId,
    assessor: 'privacy',
    summary: 'Support case management processing reviewed.'
  });

  const submitted = await repos.processingInventory.submitDpia(dpia.id);
  const decision = await repos.processingInventory.decideDpia({
    dpiaId: dpia.id,
    tenantId,
    decisionType: 'approve_with_conditions',
    decidedBy: 'privacy-lead',
    rationale: 'Approved with retention-control improvements.',
    conditions: ['Validate retention policy mapping.']
  });

  const task = await repos.processingInventory.createTask({
    dpiaId: dpia.id,
    activityId: activity.id,
    tenantId,
    title: 'Map retention policy to support cases',
    owner: 'records'
  });
  const completedTask = await repos.processingInventory.completeTask(task.id);

  const reviewedActivity = await repos.processingInventory.reviewActivity(activity.id);
  const metrics = await repos.processingInventory.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, activity: reviewedActivity, category, mapping, dpia: submitted, decision, task: completedTask, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
