const svc=require('../apps/api/src/services/phase15PostGaLtsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'operational-resilience-exercises',name:'Operational Resilience Exercises'});
if(row.domain!=='operational-resilience-exercises'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['operational-resilience-exercises']!==1)process.exit(1);
console.log('Sprint 263 Operational Resilience Exercises test passed.');
