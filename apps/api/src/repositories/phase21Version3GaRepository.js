const { makeId, now } = require('../services/id');
const svc = require('../services/phase21Version3GaService');
function createPhase21Version3GaRepository(store) {
  function ensure(data) { data.phase21Version3GaRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase21version3Ga'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase21Version3GaRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase21Version3GaRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase21Version3GaRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase21Version3GaRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase21Version3GaRecords[index]=svc.transitionRecord(data.phase21Version3GaRecords[index],action); store.write(data); return data.phase21Version3GaRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase21Version3GaRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase21Version3GaRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase21Version3GaRepository };
