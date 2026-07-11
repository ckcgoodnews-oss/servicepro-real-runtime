const svc=require('../apps/api/src/services/phase15PostGaLtsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'version-2-0-1-maintenance-release',name:'Version 2 0 1 Maintenance Release'});
if(row.domain!=='version-2-0-1-maintenance-release'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['version-2-0-1-maintenance-release']!==1)process.exit(1);
console.log('Sprint 265 Version 2 0 1 Maintenance Release test passed.');
