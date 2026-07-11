const svc=require('../apps/api/src/services/phase20Version3FoundationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'event-driven-architecture-foundation',name:'Event Driven Architecture Foundation'});
if(row.domain!=='event-driven-architecture-foundation'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['event-driven-architecture-foundation']!==1)process.exit(1);
console.log('Sprint 331 Event Driven Architecture Foundation test passed.');
