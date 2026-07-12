const svc=require('../apps/api/src/services/phase31WorkforceCommerceNetworkService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'workforce-capacity-exchange',name:'Workforce Capacity Exchange'});
if(row.domain!=='workforce-capacity-exchange'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['workforce-capacity-exchange']!==1)process.exit(1);
console.log('Sprint 495 Workforce Capacity Exchange test passed.');
