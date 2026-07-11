const svc=require('../apps/api/src/services/phase18IndustrySolutionsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'industry-solution-framework',name:'Industry Solution Framework'});
if(row.domain!=='industry-solution-framework'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['industry-solution-framework']!==1)process.exit(1);
console.log('Sprint 296 Industry Solution Framework test passed.');
