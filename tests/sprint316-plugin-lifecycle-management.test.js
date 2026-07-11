const svc=require('../apps/api/src/services/phase19PlatformExtensibilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'plugin-lifecycle-management',name:'Plugin Lifecycle Management'});
if(row.domain!=='plugin-lifecycle-management'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['plugin-lifecycle-management']!==1)process.exit(1);
console.log('Sprint 316 Plugin Lifecycle Management test passed.');
