const svc=require('../apps/api/src/services/phase20Version3FoundationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'modular-monolith-boundaries',name:'Modular Monolith Boundaries'});
if(row.domain!=='modular-monolith-boundaries'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['modular-monolith-boundaries']!==1)process.exit(1);
console.log('Sprint 332 Modular Monolith Boundaries test passed.');
