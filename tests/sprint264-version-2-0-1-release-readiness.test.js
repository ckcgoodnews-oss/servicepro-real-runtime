const svc=require('../apps/api/src/services/phase15PostGaLtsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'version-2-0-1-release-readiness',name:'Version 2 0 1 Release Readiness'});
if(row.domain!=='version-2-0-1-release-readiness'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['version-2-0-1-release-readiness']!==1)process.exit(1);
console.log('Sprint 264 Version 2 0 1 Release Readiness test passed.');
