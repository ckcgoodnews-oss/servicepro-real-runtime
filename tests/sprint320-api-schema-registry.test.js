const svc=require('../apps/api/src/services/phase19PlatformExtensibilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'api-schema-registry',name:'Api Schema Registry'});
if(row.domain!=='api-schema-registry'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['api-schema-registry']!==1)process.exit(1);
console.log('Sprint 320 Api Schema Registry test passed.');
