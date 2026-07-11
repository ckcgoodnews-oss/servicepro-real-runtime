const svc=require('../apps/api/src/services/phase20Version3FoundationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'version3-migration-assistant',name:'Version3 Migration Assistant'});
if(row.domain!=='version3-migration-assistant'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['version3-migration-assistant']!==1)process.exit(1);
console.log('Sprint 338 Version3 Migration Assistant test passed.');
