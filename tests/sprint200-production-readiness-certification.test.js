const svc=require('../apps/api/src/services/phase11PlatformOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'production-readiness-certification',name:'Production Readiness Certification'});
if(row.domain!=='production-readiness-certification'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 200 Production Readiness Certification test passed.');
