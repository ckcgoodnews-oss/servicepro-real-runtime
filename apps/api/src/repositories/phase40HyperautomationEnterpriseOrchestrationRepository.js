const { makeId, now } = require('../services/id');
const svc = require('../services/phase40HyperautomationEnterpriseOrchestrationService');
function createPhase40HyperautomationEnterpriseOrchestrationRepository(store) {
  function ensure(data) { data.phase40HyperautomationEnterpriseOrchestrationRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase40'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase40HyperautomationEnterpriseOrchestrationRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase40HyperautomationEnterpriseOrchestrationRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase40HyperautomationEnterpriseOrchestrationRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase40HyperautomationEnterpriseOrchestrationRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase40HyperautomationEnterpriseOrchestrationRecords[index]=svc.transitionRecord(data.phase40HyperautomationEnterpriseOrchestrationRecords[index],action); store.write(data); return data.phase40HyperautomationEnterpriseOrchestrationRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase40HyperautomationEnterpriseOrchestrationRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase40HyperautomationEnterpriseOrchestrationRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase40HyperautomationEnterpriseOrchestrationRepository };
