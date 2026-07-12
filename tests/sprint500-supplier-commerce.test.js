const svc=require('../apps/api/src/services/phase31WorkforceCommerceNetworkService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'supplier-commerce',name:'Supplier Commerce'});
if(row.domain!=='supplier-commerce'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['supplier-commerce']!==1)process.exit(1);
console.log('Sprint 500 Supplier Commerce test passed.');
