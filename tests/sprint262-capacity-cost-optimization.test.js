const svc=require('../apps/api/src/services/phase15PostGaLtsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'capacity-cost-optimization',name:'Capacity Cost Optimization'});
if(row.domain!=='capacity-cost-optimization'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['capacity-cost-optimization']!==1)process.exit(1);
console.log('Sprint 262 Capacity Cost Optimization test passed.');
