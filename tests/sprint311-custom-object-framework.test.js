const svc=require('../apps/api/src/services/phase19PlatformExtensibilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'custom-object-framework',name:'Custom Object Framework'});
if(row.domain!=='custom-object-framework'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['custom-object-framework']!==1)process.exit(1);
console.log('Sprint 311 Custom Object Framework test passed.');
