const svc=require('../apps/api/src/services/phase39Version6GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'database-v6-upgrade-certification',name:'Database V6 Upgrade Certification'});
if(row.domain!=='database-v6-upgrade-certification'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['database-v6-upgrade-certification']!==1)process.exit(1);
console.log('Sprint 614 Database V6 Upgrade Certification test passed.');
