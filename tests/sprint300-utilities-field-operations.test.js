const svc=require('../apps/api/src/services/phase18IndustrySolutionsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'utilities-field-operations',name:'Utilities Field Operations'});
if(row.domain!=='utilities-field-operations'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['utilities-field-operations']!==1)process.exit(1);
console.log('Sprint 300 Utilities Field Operations test passed.');
