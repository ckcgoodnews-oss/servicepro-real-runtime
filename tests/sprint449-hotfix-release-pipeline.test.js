const svc=require('../apps/api/src/services/phase28Version4PostGaReliabilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'hotfix-release-pipeline',name:'Hotfix Release Pipeline'});
if(row.domain!=='hotfix-release-pipeline'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['hotfix-release-pipeline']!==1)process.exit(1);
console.log('Sprint 449 Hotfix Release Pipeline test passed.');
