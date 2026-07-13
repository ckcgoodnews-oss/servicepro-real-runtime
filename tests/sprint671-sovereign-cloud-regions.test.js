const svc=require('../apps/api/src/services/phase43GlobalFederationSovereignCloudService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'sovereign-cloud-regions',name:'Sovereign Cloud Regions'});
if(row.domain!=='sovereign-cloud-regions'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['sovereign-cloud-regions']!==1)process.exit(1);
console.log('Sprint 671 Sovereign Cloud Regions test passed.');
