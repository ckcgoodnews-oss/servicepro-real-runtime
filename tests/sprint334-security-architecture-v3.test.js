const svc=require('../apps/api/src/services/phase20Version3FoundationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'security-architecture-v3',name:'Security Architecture V3'});
if(row.domain!=='security-architecture-v3'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['security-architecture-v3']!==1)process.exit(1);
console.log('Sprint 334 Security Architecture V3 test passed.');
