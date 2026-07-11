const svc=require('../apps/api/src/services/phase18IndustrySolutionsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'telecommunications-field-operations',name:'Telecommunications Field Operations'});
if(row.domain!=='telecommunications-field-operations'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['telecommunications-field-operations']!==1)process.exit(1);
console.log('Sprint 303 Telecommunications Field Operations test passed.');
