const svc=require('../apps/api/src/services/phase18IndustrySolutionsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'education-campus-operations',name:'Education Campus Operations'});
if(row.domain!=='education-campus-operations'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['education-campus-operations']!==1)process.exit(1);
console.log('Sprint 304 Education Campus Operations test passed.');
