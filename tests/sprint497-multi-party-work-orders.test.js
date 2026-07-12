const svc=require('../apps/api/src/services/phase31WorkforceCommerceNetworkService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'multi-party-work-orders',name:'Multi Party Work Orders'});
if(row.domain!=='multi-party-work-orders'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['multi-party-work-orders']!==1)process.exit(1);
console.log('Sprint 497 Multi Party Work Orders test passed.');
