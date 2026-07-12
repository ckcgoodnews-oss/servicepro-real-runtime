const svc=require('../apps/api/src/services/phase32Version5FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'tenant-isolation-v5',name:'Tenant Isolation V5'});
if(row.domain!=='tenant-isolation-v5'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['tenant-isolation-v5']!==1)process.exit(1);
console.log('Sprint 513 Tenant Isolation V5 test passed.');
