const { makeId, now } = require('../services/id');
const svc = require('../services/phase39Version6GaService');
function createPhase39version6gaRepository(store) {
  function ensure(data) { data.phase39Version6GaRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase39'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase39Version6GaRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase39Version6GaRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase39Version6GaRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase39Version6GaRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase39Version6GaRecords[index]=svc.transitionRecord(data.phase39Version6GaRecords[index],action); store.write(data); return data.phase39Version6GaRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase39Version6GaRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase39Version6GaRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase39version6gaRepository };
