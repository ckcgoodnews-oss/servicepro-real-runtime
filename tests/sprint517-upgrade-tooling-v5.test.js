const svc=require('../apps/api/src/services/phase32Version5FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'upgrade-tooling-v5',name:'Upgrade Tooling V5'});
if(row.domain!=='upgrade-tooling-v5'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['upgrade-tooling-v5']!==1)process.exit(1);
console.log('Sprint 517 Upgrade Tooling V5 test passed.');
