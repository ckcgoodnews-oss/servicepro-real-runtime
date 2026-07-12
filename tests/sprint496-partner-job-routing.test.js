const svc=require('../apps/api/src/services/phase31WorkforceCommerceNetworkService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'partner-job-routing',name:'Partner Job Routing'});
if(row.domain!=='partner-job-routing'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['partner-job-routing']!==1)process.exit(1);
console.log('Sprint 496 Partner Job Routing test passed.');
