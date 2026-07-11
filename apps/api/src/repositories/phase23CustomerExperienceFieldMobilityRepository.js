const { makeId, now } = require('../services/id');
const svc = require('../services/phase23CustomerExperienceFieldMobilityService');
function createPhase23CustomerExperienceFieldMobilityRepository(store) {
  function ensure(data) { data.phase23CustomerExperienceFieldMobilityRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase23CustomerExperienceFieldMobility'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase23CustomerExperienceFieldMobilityRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase23CustomerExperienceFieldMobilityRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase23CustomerExperienceFieldMobilityRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase23CustomerExperienceFieldMobilityRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase23CustomerExperienceFieldMobilityRecords[index]=svc.transitionRecord(data.phase23CustomerExperienceFieldMobilityRecords[index],action); store.write(data); return data.phase23CustomerExperienceFieldMobilityRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase23CustomerExperienceFieldMobilityRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase23CustomerExperienceFieldMobilityRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase23CustomerExperienceFieldMobilityRepository };
