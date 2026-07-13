const svc=require('../apps/api/src/services/phase43GlobalFederationSovereignCloudService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'global-routing-and-failover',name:'Global Routing And Failover'});
if(row.domain!=='global-routing-and-failover'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['global-routing-and-failover']!==1)process.exit(1);
console.log('Sprint 678 Global Routing And Failover test passed.');
