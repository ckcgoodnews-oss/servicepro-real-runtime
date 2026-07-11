const svc=require('../apps/api/src/services/phase19PlatformExtensibilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'business-rule-designer',name:'Business Rule Designer'});
if(row.domain!=='business-rule-designer'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['business-rule-designer']!==1)process.exit(1);
console.log('Sprint 314 Business Rule Designer test passed.');
