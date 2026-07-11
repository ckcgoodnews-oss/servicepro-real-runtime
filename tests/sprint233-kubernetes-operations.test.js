const svc=require('../apps/api/src/services/phase14EnterpriseProductionService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'kubernetes-operations',name:'Kubernetes Operations'});
if(row.domain!=='kubernetes-operations'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 233 Kubernetes Operations test passed.');
