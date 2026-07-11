const svc=require('../apps/api/src/services/phase17GlobalScaleService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'edge-synchronization',name:'Edge Synchronization'});
if(row.domain!=='edge-synchronization'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['edge-synchronization']!==1)process.exit(1);
console.log('Sprint 287 Edge Synchronization test passed.');
