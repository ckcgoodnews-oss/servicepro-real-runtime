const svc=require('../apps/api/src/services/phase17GlobalScaleService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'global-identity-federation',name:'Global Identity Federation'});
if(row.domain!=='global-identity-federation'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['global-identity-federation']!==1)process.exit(1);
console.log('Sprint 284 Global Identity Federation test passed.');
