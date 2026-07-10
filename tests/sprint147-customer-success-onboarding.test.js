const fs = require('fs');
const required = ['apps/api/src/services/customerSuccessOnboardingService.js','apps/api/src/repositories/customerSuccessOnboardingRepository.js','apps/api/src/routes/customerSuccessOnboarding.js','scripts/seed-customer-success-onboarding.js','packages/database/postgres/147_customer_success_onboarding.sql','docs/sprint147-customer-success-onboarding.md'];
for (const file of required) { if (!fs.existsSync(file)) { console.error(`Missing required Sprint 147 patch file: ${file}`); process.exit(1); } }
const svc = require('../apps/api/src/services/customerSuccessOnboardingService');

let cohort = svc.normalizeCohortInput({ tenantId: 'tenant_demo', name: 'July Launch' });
if (cohort.code !== 'JULY-LAUNCH') process.exit(1);
cohort = svc.completeCohort(svc.activateCohort(cohort));
if (cohort.status !== 'completed') process.exit(1);

let plan = svc.normalizeOnboardingPlanInput({ tenantId: 'tenant_demo', customerTenantId: 'cust1' });
plan = svc.completePlan(svc.startPlan(plan));
if (plan.status !== 'completed') process.exit(1);

let task = svc.normalizeTaskInput({ planId: 'plan1', title: 'Configure Domain' });
task = svc.completeTask(svc.startTask(task));
if (task.status !== 'completed') process.exit(1);
if (svc.onboardingProgress([task]) !== 100) process.exit(1);

const metric = svc.normalizeAdoptionMetricInput({ tenantId: 'tenant_demo', customerTenantId: 'cust1', metricName: 'wau', metricValue: 5, targetValue: 10 });
if (svc.adoptionHealth(metric) !== 'at_risk') process.exit(1);

let feedback = svc.normalizeFeedbackInput({ tenantId: 'tenant_demo', customerTenantId: 'cust1', summary: 'Need branding', feedbackType: 'feature_request' });
feedback = svc.resolveFeedback(svc.reviewFeedback(feedback, 'product'), 'roadmap');
if (feedback.status !== 'resolved') process.exit(1);

let escalation = svc.normalizeEscalationInput({ tenantId: 'tenant_demo', customerTenantId: 'cust1', title: 'Email delay', severity: 'critical' });
escalation = svc.closeEscalation(svc.resolveEscalation(svc.startEscalation(escalation, 'support'), 'fixed'));
if (escalation.status !== 'closed') process.exit(1);

let successPlan = svc.normalizeSuccessPlanInput({ tenantId: 'tenant_demo', customerTenantId: 'cust1' });
successPlan = svc.markSuccessPlanAtRisk(svc.activateSuccessPlan(successPlan), 'Low adoption');
if (successPlan.status !== 'at_risk') process.exit(1);

const metrics = svc.customerSuccessMetrics({ cohorts: [{...cohort, status: 'active'}], plans: [plan], tasks: [task], metrics: [metric], feedback: [{...feedback, status: 'new'}], escalations: [{...escalation, status: 'open', severity: 'critical'}], successPlans: [successPlan] });
if (metrics.activeCohorts !== 1 || metrics.completedOnboardingPlans !== 1 || metrics.completedTasks !== 1 || metrics.atRiskAdoptionMetrics !== 1 || metrics.openFeedback !== 1 || metrics.criticalEscalations !== 1 || metrics.atRiskSuccessPlans !== 1) process.exit(1);
console.log('Sprint 147 customer success onboarding patch test passed.');
