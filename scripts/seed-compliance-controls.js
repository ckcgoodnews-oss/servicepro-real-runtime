const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();

  const framework = await repos.complianceControls.createFramework({
    name: 'SOC 2',
    version: '2026',
    owner: 'compliance'
  });

  const control = await repos.complianceControls.createControl({
    frameworkId: framework.id,
    controlCode: 'CC6.1',
    title: 'Logical Access Controls',
    owner: 'security',
    frequency: 'quarterly',
    category: 'access'
  });

  const evidence = await repos.complianceControls.createEvidence({
    controlId: control.id,
    title: 'Quarterly access review',
    evidenceType: 'report',
    sourceSystem: 'iam',
    uri: 's3://compliance-evidence/access-review.pdf',
    collectedBy: 'compliance',
    validUntil: '2026-12-31T00:00:00.000Z'
  });

  const testRun = await repos.complianceControls.createTestRun({
    controlId: control.id,
    testedBy: 'auditor',
    sampleSize: 25
  });

  await repos.complianceControls.startTestRun(testRun.id);
  const completedTest = await repos.complianceControls.completeTestRun(testRun.id, false, 'Two access exceptions found.');

  const gap = await repos.complianceControls.createGap({
    controlId: control.id,
    testRunId: testRun.id,
    title: 'Terminated users retained access',
    severity: 'high',
    owner: 'iam-owner',
    dueAt: '2026-08-15T00:00:00.000Z'
  });

  const action = await repos.complianceControls.createCorrectiveAction({
    gapId: gap.id,
    title: 'Automate termination access removal',
    owner: 'iam-owner'
  });

  const completedAction = await repos.complianceControls.completeCorrectiveAction(action.id);
  const closedGap = await repos.complianceControls.closeGap(gap.id);
  const coverage = await repos.complianceControls.coverage(framework.id);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, framework, control, evidence, testRun: completedTest, gap: closedGap, action: completedAction, coverage }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
