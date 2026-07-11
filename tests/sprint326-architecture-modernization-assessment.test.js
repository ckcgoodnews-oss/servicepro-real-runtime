const svc=require('../apps/api/src/services/phase20Version3FoundationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'architecture-modernization-assessment',name:'Architecture Modernization Assessment'});
if(row.domain!=='architecture-modernization-assessment'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['architecture-modernization-assessment']!==1)process.exit(1);
console.log('Sprint 326 Architecture Modernization Assessment test passed.');
