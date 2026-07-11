const svc=require('../apps/api/src/services/phase15PostGaLtsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'tenant-upgrade-orchestration',name:'Tenant Upgrade Orchestration'});
if(row.domain!=='tenant-upgrade-orchestration'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['tenant-upgrade-orchestration']!==1)process.exit(1);
console.log('Sprint 257 Tenant Upgrade Orchestration test passed.');
