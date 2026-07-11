const svc=require('../apps/api/src/services/phase15PostGaLtsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'deprecation-end-of-life-management',name:'Deprecation End Of Life Management'});
if(row.domain!=='deprecation-end-of-life-management'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['deprecation-end-of-life-management']!==1)process.exit(1);
console.log('Sprint 259 Deprecation End Of Life Management test passed.');
