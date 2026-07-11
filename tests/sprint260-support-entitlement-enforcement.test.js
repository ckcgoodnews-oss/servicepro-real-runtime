const svc=require('../apps/api/src/services/phase15PostGaLtsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'support-entitlement-enforcement',name:'Support Entitlement Enforcement'});
if(row.domain!=='support-entitlement-enforcement'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['support-entitlement-enforcement']!==1)process.exit(1);
console.log('Sprint 260 Support Entitlement Enforcement test passed.');
