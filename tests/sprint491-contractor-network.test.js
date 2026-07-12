const svc=require('../apps/api/src/services/phase31WorkforceCommerceNetworkService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'contractor-network',name:'Contractor Network'});
if(row.domain!=='contractor-network'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['contractor-network']!==1)process.exit(1);
console.log('Sprint 491 Contractor Network test passed.');
