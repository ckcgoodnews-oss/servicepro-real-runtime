const fs = require('fs');
const required = ['apps/api/src/services/goLiveHypercareService.js','apps/api/src/repositories/goLiveHypercareRepository.js','apps/api/src/routes/goLiveHypercare.js','scripts/seed-go-live-hypercare.js','packages/database/postgres/146_go_live_hypercare.sql','docs/sprint146-go-live-hypercare.md'];
for (const file of required) { if (!fs.existsSync(file)) { console.error(`Missing required Sprint 146 patch file: ${file}`); process.exit(1); } }
const svc = require('../apps/api/src/services/goLiveHypercareService');

let checklist = svc.normalizeChecklistInput({ tenantId: 'tenant_demo', title: 'Approval', severity: 'high' });
if (checklist.code !== 'APPROVAL') process.exit(1);
checklist = svc.completeChecklist(checklist, 's3://evidence');
if (checklist.status !== 'completed') process.exit(1);

let plan = svc.normalizeCutoverPlanInput({ tenantId: 'tenant_demo', name: 'Launch' });
plan = svc.approveCutover(plan, 'owner');
plan = svc.startCutover(plan);
if (plan.status !== 'running') process.exit(1);

let step = svc.normalizeCutoverStepInput({ cutoverPlanId: 'plan1', title: 'Deploy', sequence: 1 });
step = svc.completeStep(svc.startStep(step));
if (step.status !== 'completed') process.exit(1);
if (!svc.stepsComplete([step])) process.exit(1);

let dns = svc.normalizeDnsCutoverInput({ tenantId: 'tenant_demo', domain: 'app.example.com' });
dns = svc.completeDns(svc.startDnsPropagation(svc.validateDns(dns)));
if (dns.status !== 'completed') process.exit(1);

let comm = svc.normalizeLaunchCommunicationInput({ tenantId: 'tenant_demo', audience: 'customers' });
comm = svc.sendCommunication(svc.approveCommunication(comm, 'lead'));
if (comm.status !== 'sent') process.exit(1);

let decision = svc.normalizeRollbackDecisionInput({ tenantId: 'tenant_demo', cutoverPlanId: 'plan1' });
decision = svc.executeRollback(svc.approveRollback(svc.recommendRollback(decision, 'critical issue'), 'owner'));
if (decision.status !== 'executed') process.exit(1);

let issue = svc.normalizeHypercareIssueInput({ tenantId: 'tenant_demo', title: 'Login issue', severity: 'critical' });
issue = svc.closeIssue(svc.resolveIssue(issue, 'fixed'));
if (issue.status !== 'closed') process.exit(1);

let report = svc.publishDailyReport(svc.normalizeDailyReportInput({ tenantId: 'tenant_demo', openIssueCount: 0 }), 'lead');
if (report.status !== 'published') process.exit(1);

if (!svc.goLiveReady({ checklist: [checklist], cutoverPlans: [plan], dns: [dns] })) process.exit(1);
const metrics = svc.hypercareMetrics({ checklist: [checklist], cutoverPlans: [plan], steps: [step], dns: [dns], communications: [comm], decisions: [decision], issues: [{...issue, status: 'open'}], reports: [report] });
if (metrics.completedChecklist !== 1 || metrics.activeCutovers !== 1 || metrics.completedSteps !== 1 || metrics.completedDnsRecords !== 1 || metrics.sentCommunications !== 1 || metrics.executedRollbacks !== 1 || metrics.criticalIssues !== 1 || metrics.publishedReports !== 1) process.exit(1);
console.log('Sprint 146 go-live hypercare patch test passed.');
