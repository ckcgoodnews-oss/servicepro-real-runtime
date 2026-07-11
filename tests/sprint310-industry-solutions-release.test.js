const svc=require('../apps/api/src/services/phase18IndustrySolutionsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'industry-solutions-release',name:'Industry Solutions Release'});
if(row.domain!=='industry-solutions-release'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['industry-solutions-release']!==1)process.exit(1);
console.log('Sprint 310 Industry Solutions Release test passed.');
