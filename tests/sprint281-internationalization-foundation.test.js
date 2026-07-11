const svc=require('../apps/api/src/services/phase17GlobalScaleService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'internationalization-foundation',name:'Internationalization Foundation'});
if(row.domain!=='internationalization-foundation'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['internationalization-foundation']!==1)process.exit(1);
console.log('Sprint 281 Internationalization Foundation test passed.');
