const svc=require('../apps/api/src/services/phase43GlobalFederationSovereignCloudService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'global-service-catalog-federation',name:'Global Service Catalog Federation'});
if(row.domain!=='global-service-catalog-federation'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['global-service-catalog-federation']!==1)process.exit(1);
console.log('Sprint 683 Global Service Catalog Federation test passed.');
