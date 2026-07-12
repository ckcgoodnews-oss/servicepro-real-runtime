const { makeId, now } = require('../services/id');
const svc = require('../services/phase37SustainabilityCircularOperationsService');
function createPhase37sustainabilitycircularoperationsRepository(store) {
  function ensure(data) { data.phase37SustainabilityCircularOperationsRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase37'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase37SustainabilityCircularOperationsRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase37SustainabilityCircularOperationsRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase37SustainabilityCircularOperationsRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase37SustainabilityCircularOperationsRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase37SustainabilityCircularOperationsRecords[index]=svc.transitionRecord(data.phase37SustainabilityCircularOperationsRecords[index],action); store.write(data); return data.phase37SustainabilityCircularOperationsRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase37SustainabilityCircularOperationsRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase37SustainabilityCircularOperationsRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase37sustainabilitycircularoperationsRepository };
