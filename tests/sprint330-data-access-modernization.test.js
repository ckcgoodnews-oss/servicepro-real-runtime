const svc=require('../apps/api/src/services/phase20Version3FoundationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'data-access-modernization',name:'Data Access Modernization'});
if(row.domain!=='data-access-modernization'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['data-access-modernization']!==1)process.exit(1);
console.log('Sprint 330 Data Access Modernization test passed.');
