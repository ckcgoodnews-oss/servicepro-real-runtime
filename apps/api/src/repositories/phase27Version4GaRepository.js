const { makeId, now } = require('../services/id');
const svc = require('../services/phase27Version4GaService');
function createPhase27Version4GaRepository(store) {
  function ensure(data) { data.phase27Version4GaRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase27Version4Ga'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase27Version4GaRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase27Version4GaRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase27Version4GaRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase27Version4GaRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase27Version4GaRecords[index]=svc.transitionRecord(data.phase27Version4GaRecords[index],action); store.write(data); return data.phase27Version4GaRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase27Version4GaRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase27Version4GaRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase27Version4GaRepository };
