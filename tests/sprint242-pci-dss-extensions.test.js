const svc=require('../apps/api/src/services/phase14EnterpriseProductionService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'pci-dss-extensions',name:'PCI DSS Extensions'});
if(row.domain!=='pci-dss-extensions'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate'); if(active.status!=='active')process.exit(1);
console.log('Sprint 242 PCI DSS Extensions test passed.');
