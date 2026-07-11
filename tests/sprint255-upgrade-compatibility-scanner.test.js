const svc=require('../apps/api/src/services/phase15PostGaLtsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'upgrade-compatibility-scanner',name:'Upgrade Compatibility Scanner'});
if(row.domain!=='upgrade-compatibility-scanner'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['upgrade-compatibility-scanner']!==1)process.exit(1);
console.log('Sprint 255 Upgrade Compatibility Scanner test passed.');
