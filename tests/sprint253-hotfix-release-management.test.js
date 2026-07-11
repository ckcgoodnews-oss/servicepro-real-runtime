const svc=require('../apps/api/src/services/phase15PostGaLtsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'hotfix-release-management',name:'Hotfix Release Management'});
if(row.domain!=='hotfix-release-management'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['hotfix-release-management']!==1)process.exit(1);
console.log('Sprint 253 Hotfix Release Management test passed.');
