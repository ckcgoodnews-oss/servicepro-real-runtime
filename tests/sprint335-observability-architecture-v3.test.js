const svc=require('../apps/api/src/services/phase20Version3FoundationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'observability-architecture-v3',name:'Observability Architecture V3'});
if(row.domain!=='observability-architecture-v3'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['observability-architecture-v3']!==1)process.exit(1);
console.log('Sprint 335 Observability Architecture V3 test passed.');
