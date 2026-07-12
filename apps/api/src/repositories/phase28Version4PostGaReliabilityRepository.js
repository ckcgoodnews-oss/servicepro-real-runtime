const { makeId, now } = require('../services/id');
const svc = require('../services/phase28Version4PostGaReliabilityService');
function createPhase28Version4PostGaReliabilityRepository(store) {
  function ensure(data) { data.phase28Version4PostGaReliabilityRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase28'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase28Version4PostGaReliabilityRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase28Version4PostGaReliabilityRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase28Version4PostGaReliabilityRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase28Version4PostGaReliabilityRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase28Version4PostGaReliabilityRecords[index]=svc.transitionRecord(data.phase28Version4PostGaReliabilityRecords[index],action); store.write(data); return data.phase28Version4PostGaReliabilityRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase28Version4PostGaReliabilityRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase28Version4PostGaReliabilityRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase28Version4PostGaReliabilityRepository };
