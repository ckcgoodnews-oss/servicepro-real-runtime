const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');
async function main() {
  resetRepositoriesForTest(); const repos = getRepositories(); const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';
  const source = await repos.siemDetectionEngineering.createSource({ tenantId, name: 'Identity Provider Logs', sourceType: 'identity', owner: 'soc', ingestMethod: 'api', parserName: 'idp_json' });
  const activeSource = await repos.siemDetectionEngineering.activateSource(source.id);
  const rule = await repos.siemDetectionEngineering.createRule({ tenantId, name: 'Impossible Travel Admin Login', ruleType: 'kql', severity: 'high', query: 'SigninLogs | where RiskEventTypes has "impossibleTravel"', sourceIds: [source.id], tactic: 'Credential Access', technique: 'T1078', owner: 'soc' });
  const activeRule = await repos.siemDetectionEngineering.activateRule(rule.id);
  const test = await repos.siemDetectionEngineering.createRuleTest({ tenantId, ruleId: rule.id, expectedMatch: true, sampleEvent: { user: 'admin@example.com' } });
  const passedTest = await repos.siemDetectionEngineering.runRuleTest(test.id, true);
  const suppression = await repos.siemDetectionEngineering.createSuppression({ tenantId, ruleId: rule.id, entityType: 'user', entityValue: 'test-admin@example.com', reason: 'Known lab account', createdBy: 'soc' });
  const alert = await repos.siemDetectionEngineering.createAlert({ tenantId, ruleId: rule.id, sourceId: source.id, title: 'Impossible travel for admin account', severity: 'high', entityType: 'user', entityValue: 'admin@example.com', eventCount: 2 });
  const triaged = await repos.siemDetectionEngineering.triageAlert(alert.id, 'analyst1');
  const escalated = await repos.siemDetectionEngineering.escalateAlert(alert.id, 'secinc_demo_001');
  const tuning = await repos.siemDetectionEngineering.createTuning({ tenantId, ruleId: rule.id, summary: 'Exclude lab accounts', beforeQuery: rule.query, afterQuery: rule.query + ' | where UserPrincipalName !endswith ".lab"' });
  await repos.siemDetectionEngineering.approveTuning(tuning.id, 'soc-lead');
  const appliedTuning = await repos.siemDetectionEngineering.applyTuning(tuning.id);
  const metrics = await repos.siemDetectionEngineering.metrics(tenantId);
  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, source: activeSource, rule: activeRule, test: passedTest, suppression, alert: escalated, triaged, tuning: appliedTuning, metrics }, null, 2));
}
main().catch(err => { console.error(err); process.exit(1); });
