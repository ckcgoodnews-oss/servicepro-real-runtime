const svc=require('../apps/api/src/services/phase11PlatformOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'tenant-isolation-validation',name:'Tenant Isolation Validation'});
if(row.domain!=='tenant-isolation-validation'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 197 Tenant Isolation Validation test passed.');
