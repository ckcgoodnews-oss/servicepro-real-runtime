const svc=require('../apps/api/src/services/phase18IndustrySolutionsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'industry-analytics-packs',name:'Industry Analytics Packs'});
if(row.domain!=='industry-analytics-packs'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['industry-analytics-packs']!==1)process.exit(1);
console.log('Sprint 308 Industry Analytics Packs test passed.');
