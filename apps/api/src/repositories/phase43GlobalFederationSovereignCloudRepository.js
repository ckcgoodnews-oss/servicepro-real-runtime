const { makeId, now } = require('../services/id');
const svc = require('../services/phase43GlobalFederationSovereignCloudService');
function createPhase43GlobalFederationSovereignCloudRepository(store) {
  function ensure(data) { data.phase43GlobalFederationSovereignCloudRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase43'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase43GlobalFederationSovereignCloudRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase43GlobalFederationSovereignCloudRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase43GlobalFederationSovereignCloudRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase43GlobalFederationSovereignCloudRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase43GlobalFederationSovereignCloudRecords[index]=svc.transitionRecord(data.phase43GlobalFederationSovereignCloudRecords[index],action); store.write(data); return data.phase43GlobalFederationSovereignCloudRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase43GlobalFederationSovereignCloudRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase43GlobalFederationSovereignCloudRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase43GlobalFederationSovereignCloudRepository };
