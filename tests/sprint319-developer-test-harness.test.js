const svc=require('../apps/api/src/services/phase19PlatformExtensibilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'developer-test-harness',name:'Developer Test Harness'});
if(row.domain!=='developer-test-harness'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['developer-test-harness']!==1)process.exit(1);
console.log('Sprint 319 Developer Test Harness test passed.');
