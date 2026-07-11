const svc=require('../apps/api/src/services/phase23CustomerExperienceFieldMobilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'technician-route-intelligence',name:'Technician Route Intelligence'});
if(row.domain!=='technician-route-intelligence'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['technician-route-intelligence']!==1)process.exit(1);
console.log('Sprint 373 Technician Route Intelligence test passed.');
