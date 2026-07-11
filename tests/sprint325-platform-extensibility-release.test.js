const svc=require('../apps/api/src/services/phase19PlatformExtensibilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'platform-extensibility-release',name:'Platform Extensibility Release'});
if(row.domain!=='platform-extensibility-release'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['platform-extensibility-release']!==1)process.exit(1);
console.log('Sprint 325 Platform Extensibility Release test passed.');
