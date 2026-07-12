const svc=require('../apps/api/src/services/phase33Version5GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'database-v5-upgrade-certification',name:'Database V5 Upgrade Certification'});
if(row.domain!=='database-v5-upgrade-certification'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['database-v5-upgrade-certification']!==1)process.exit(1);
console.log('Sprint 524 Database V5 Upgrade Certification test passed.');
