const svc=require('../apps/api/src/services/phase19PlatformExtensibilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'event-schema-registry',name:'Event Schema Registry'});
if(row.domain!=='event-schema-registry'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['event-schema-registry']!==1)process.exit(1);
console.log('Sprint 321 Event Schema Registry test passed.');
