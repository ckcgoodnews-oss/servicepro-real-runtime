const svc=require('../apps/api/src/services/phase43GlobalFederationSovereignCloudService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'sovereign-key-management',name:'Sovereign Key Management'});
if(row.domain!=='sovereign-key-management'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['sovereign-key-management']!==1)process.exit(1);
console.log('Sprint 680 Sovereign Key Management test passed.');
