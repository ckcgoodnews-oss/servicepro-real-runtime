const svc=require('../apps/api/src/services/phase19PlatformExtensibilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'plugin-runtime-v2',name:'Plugin Runtime V2'});
if(row.domain!=='plugin-runtime-v2'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['plugin-runtime-v2']!==1)process.exit(1);
console.log('Sprint 315 Plugin Runtime V2 test passed.');
