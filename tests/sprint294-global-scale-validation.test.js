const svc=require('../apps/api/src/services/phase17GlobalScaleService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'global-scale-validation',name:'Global Scale Validation'});
if(row.domain!=='global-scale-validation'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['global-scale-validation']!==1)process.exit(1);
console.log('Sprint 294 Global Scale Validation test passed.');
