const svc=require('../apps/api/src/services/phase11PlatformOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'enterprise-backup-manager',name:'Enterprise Backup Manager'});
if(row.domain!=='enterprise-backup-manager'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 199 Enterprise Backup Manager test passed.');
