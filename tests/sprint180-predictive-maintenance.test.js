const svc=require('../apps/api/src/services/phase10AiPlatformService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'predictive-maintenance',name:'Predictive Maintenance'});
if(row.domain!=='predictive-maintenance'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 180 Predictive Maintenance test passed.');
