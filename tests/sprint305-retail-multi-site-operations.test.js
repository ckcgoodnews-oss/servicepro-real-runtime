const svc=require('../apps/api/src/services/phase18IndustrySolutionsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'retail-multi-site-operations',name:'Retail Multi Site Operations'});
if(row.domain!=='retail-multi-site-operations'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['retail-multi-site-operations']!==1)process.exit(1);
console.log('Sprint 305 Retail Multi Site Operations test passed.');
