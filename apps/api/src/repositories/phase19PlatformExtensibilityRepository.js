const { makeId, now } = require('../services/id');
const svc = require('../services/phase19PlatformExtensibilityService');
function createPhase19PlatformExtensibilityRepository(store) {
  function ensure(data) { data.phase19PlatformExtensibilityRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase19platformExtensibility'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase19PlatformExtensibilityRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase19PlatformExtensibilityRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase19PlatformExtensibilityRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase19PlatformExtensibilityRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase19PlatformExtensibilityRecords[index]=svc.transitionRecord(data.phase19PlatformExtensibilityRecords[index],action); store.write(data); return data.phase19PlatformExtensibilityRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase19PlatformExtensibilityRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase19PlatformExtensibilityRepository };
