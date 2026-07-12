const svc=require('../apps/api/src/services/phase31WorkforceCommerceNetworkService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'escrow-settlement',name:'Escrow Settlement'});
if(row.domain!=='escrow-settlement'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['escrow-settlement']!==1)process.exit(1);
console.log('Sprint 498 Escrow Settlement test passed.');
