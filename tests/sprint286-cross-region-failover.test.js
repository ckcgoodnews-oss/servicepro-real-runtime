const svc=require('../apps/api/src/services/phase17GlobalScaleService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'cross-region-failover',name:'Cross Region Failover'});
if(row.domain!=='cross-region-failover'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['cross-region-failover']!==1)process.exit(1);
console.log('Sprint 286 Cross Region Failover test passed.');
