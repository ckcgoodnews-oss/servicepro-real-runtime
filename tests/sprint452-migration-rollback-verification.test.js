const svc=require('../apps/api/src/services/phase28Version4PostGaReliabilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'migration-rollback-verification',name:'Migration Rollback Verification'});
if(row.domain!=='migration-rollback-verification'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['migration-rollback-verification']!==1)process.exit(1);
console.log('Sprint 452 Migration Rollback Verification test passed.');
