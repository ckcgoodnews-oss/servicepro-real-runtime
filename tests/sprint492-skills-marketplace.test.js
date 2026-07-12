const svc=require('../apps/api/src/services/phase31WorkforceCommerceNetworkService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'skills-marketplace',name:'Skills Marketplace'});
if(row.domain!=='skills-marketplace'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['skills-marketplace']!==1)process.exit(1);
console.log('Sprint 492 Skills Marketplace test passed.');
