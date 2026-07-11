const svc=require('../apps/api/src/services/phase15PostGaLtsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'migration-rollback-verification',name:'Migration Rollback Verification'});
if(row.domain!=='migration-rollback-verification'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['migration-rollback-verification']!==1)process.exit(1);
console.log('Sprint 256 Migration Rollback Verification test passed.');
