const svc=require('../apps/api/src/services/phase17GlobalScaleService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'sovereign-cloud-readiness',name:'Sovereign Cloud Readiness'});
if(row.domain!=='sovereign-cloud-readiness'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['sovereign-cloud-readiness']!==1)process.exit(1);
console.log('Sprint 293 Sovereign Cloud Readiness test passed.');
