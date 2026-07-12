const svc=require('../apps/api/src/services/phase38Version6FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'performance-certification-v6',name:'Performance Certification V6'});
if(row.domain!=='performance-certification-v6'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['performance-certification-v6']!==1)process.exit(1);
console.log('Sprint 607 Performance Certification V6 test passed.');
