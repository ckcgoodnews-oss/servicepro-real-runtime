const svc=require('../apps/api/src/services/phase31WorkforceCommerceNetworkService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'workforce-commerce-release',name:'Workforce Commerce Release'});
if(row.domain!=='workforce-commerce-release'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['workforce-commerce-release']!==1)process.exit(1);
console.log('Sprint 505 Workforce Commerce Release test passed.');
