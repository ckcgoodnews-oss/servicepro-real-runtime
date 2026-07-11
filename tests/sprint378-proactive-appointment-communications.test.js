const svc=require('../apps/api/src/services/phase23CustomerExperienceFieldMobilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'proactive-appointment-communications',name:'Proactive Appointment Communications'});
if(row.domain!=='proactive-appointment-communications'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['proactive-appointment-communications']!==1)process.exit(1);
console.log('Sprint 378 Proactive Appointment Communications test passed.');
