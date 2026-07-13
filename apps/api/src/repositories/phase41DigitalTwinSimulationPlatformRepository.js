const { makeId, now } = require('../services/id');
const svc = require('../services/phase41DigitalTwinSimulationPlatformService');
function createPhase41DigitalTwinSimulationPlatformRepository(store) {
  function ensure(data) { data.phase41DigitalTwinSimulationPlatformRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase41'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase41DigitalTwinSimulationPlatformRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase41DigitalTwinSimulationPlatformRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase41DigitalTwinSimulationPlatformRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase41DigitalTwinSimulationPlatformRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase41DigitalTwinSimulationPlatformRecords[index]=svc.transitionRecord(data.phase41DigitalTwinSimulationPlatformRecords[index],action); store.write(data); return data.phase41DigitalTwinSimulationPlatformRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase41DigitalTwinSimulationPlatformRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase41DigitalTwinSimulationPlatformRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase41DigitalTwinSimulationPlatformRepository };
