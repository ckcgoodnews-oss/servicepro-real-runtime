const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const checklist = await repos.goLiveHypercare.createChecklistItem({ tenantId, title: 'Production release approval', category: 'approval', severity: 'high', owner: 'release-manager' });
  const completedChecklist = await repos.goLiveHypercare.completeChecklistItem(checklist.id, 's3://evidence/release-approval.pdf');

  const plan = await repos.goLiveHypercare.createCutoverPlan({ tenantId, name: 'ServicePro Production Launch', releaseVersion: '1.46.0', owner: 'platform', scheduledStartAt: '2026-07-10T02:00:00.000Z', scheduledEndAt: '2026-07-10T04:00:00.000Z', rollbackPlanUrl: 's3://runbooks/rollback.pdf' });
  const approvedPlan = await repos.goLiveHypercare.approveCutover(plan.id, 'owner');
  const runningPlan = await repos.goLiveHypercare.startCutover(plan.id);

  const step1 = await repos.goLiveHypercare.createStep({ tenantId, cutoverPlanId: plan.id, title: 'Enable production deployment', sequence: 1, owner: 'platform' });
  await repos.goLiveHypercare.startStep(step1.id);
  const completedStep = await repos.goLiveHypercare.completeStep(step1.id);

  const dns = await repos.goLiveHypercare.createDns({ tenantId, cutoverPlanId: plan.id, domain: 'app.servicepro.example', previousValue: 'old.servicepro.example', targetValue: 'new.servicepro.example' });
  const validatedDns = await repos.goLiveHypercare.validateDns(dns.id);
  await repos.goLiveHypercare.startDnsPropagation(dns.id);
  const completedDns = await repos.goLiveHypercare.completeDns(dns.id);

  const comm = await repos.goLiveHypercare.createCommunication({ tenantId, cutoverPlanId: plan.id, audience: 'customers', subject: 'ServicePro launch complete', body: 'The production launch is complete.' });
  await repos.goLiveHypercare.approveCommunication(comm.id, 'release-manager');
  const sentComm = await repos.goLiveHypercare.sendCommunication(comm.id);

  const rollback = await repos.goLiveHypercare.createRollbackDecision({ tenantId, cutoverPlanId: plan.id });
  const issue = await repos.goLiveHypercare.createIssue({ tenantId, title: 'Minor login delay', severity: 'medium', source: 'support', owner: 'platform' });
  const resolvedIssue = await repos.goLiveHypercare.resolveIssue(issue.id, 'Increased login worker concurrency.');
  const closedIssue = await repos.goLiveHypercare.closeIssue(issue.id);

  const report = await repos.goLiveHypercare.createDailyReport({ tenantId, summary: 'Launch stable. One issue resolved.', openIssueCount: 0, criticalIssueCount: 0, resolvedIssueCount: 1 });
  const publishedReport = await repos.goLiveHypercare.publishDailyReport(report.id, 'hypercare-lead');

  const completedPlan = await repos.goLiveHypercare.completeCutover(plan.id);
  const goLiveReady = await repos.goLiveHypercare.goLiveReady(tenantId);
  const metrics = await repos.goLiveHypercare.metrics(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, checklist: completedChecklist, plan: completedPlan, approvedPlan, runningPlan, step: completedStep, dns: completedDns, validatedDns, communication: sentComm, rollback, issue: closedIssue, resolvedIssue, report: publishedReport, goLiveReady, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
