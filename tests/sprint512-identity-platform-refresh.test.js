const svc=require('../apps/api/src/services/phase32Version5FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'identity-platform-refresh',name:'Identity Platform Refresh'});
if(row.domain!=='identity-platform-refresh'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['identity-platform-refresh']!==1)process.exit(1);
console.log('Sprint 512 Identity Platform Refresh test passed.');
