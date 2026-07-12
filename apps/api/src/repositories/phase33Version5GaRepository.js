const { makeId, now } = require('../services/id');
const svc = require('../services/phase33Version5GaService');
function createPhase33Version5GaRepository(store) {
  function ensure(data) { data.phase33Version5GaRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase33'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase33Version5GaRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase33Version5GaRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase33Version5GaRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase33Version5GaRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase33Version5GaRecords[index]=svc.transitionRecord(data.phase33Version5GaRecords[index],action); store.write(data); return data.phase33Version5GaRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase33Version5GaRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase33Version5GaRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase33Version5GaRepository };
