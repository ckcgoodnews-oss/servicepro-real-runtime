const svc=require('../apps/api/src/services/phase20Version3FoundationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'runtime-framework-upgrade',name:'Runtime Framework Upgrade'});
if(row.domain!=='runtime-framework-upgrade'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['runtime-framework-upgrade']!==1)process.exit(1);
console.log('Sprint 327 Runtime Framework Upgrade test passed.');
