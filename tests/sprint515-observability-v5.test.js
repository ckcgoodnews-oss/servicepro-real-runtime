const svc=require('../apps/api/src/services/phase32Version5FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'observability-v5',name:'Observability V5'});
if(row.domain!=='observability-v5'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['observability-v5']!==1)process.exit(1);
console.log('Sprint 515 Observability V5 test passed.');
