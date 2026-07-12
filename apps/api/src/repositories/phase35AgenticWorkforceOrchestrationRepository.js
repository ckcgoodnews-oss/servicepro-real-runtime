const { makeId, now } = require('../services/id');
const svc = require('../services/phase35AgenticWorkforceOrchestrationService');
function createPhase35agenticworkforceorchestrationRepository(store) {
  function ensure(data) { data.phase35AgenticWorkforceOrchestrationRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase35'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase35AgenticWorkforceOrchestrationRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase35AgenticWorkforceOrchestrationRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase35AgenticWorkforceOrchestrationRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase35AgenticWorkforceOrchestrationRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase35AgenticWorkforceOrchestrationRecords[index]=svc.transitionRecord(data.phase35AgenticWorkforceOrchestrationRecords[index],action); store.write(data); return data.phase35AgenticWorkforceOrchestrationRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase35AgenticWorkforceOrchestrationRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase35AgenticWorkforceOrchestrationRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase35agenticworkforceorchestrationRepository };
