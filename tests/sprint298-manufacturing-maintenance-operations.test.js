const svc=require('../apps/api/src/services/phase18IndustrySolutionsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'manufacturing-maintenance-operations',name:'Manufacturing Maintenance Operations'});
if(row.domain!=='manufacturing-maintenance-operations'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['manufacturing-maintenance-operations']!==1)process.exit(1);
console.log('Sprint 298 Manufacturing Maintenance Operations test passed.');
