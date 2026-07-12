const { makeId, now } = require('../services/id');
const svc = require('../services/phase31WorkforceCommerceNetworkService');
function createPhase31WorkforceCommerceNetworkRepository(store) {
  function ensure(data) { data.phase31WorkforceCommerceNetworkRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase31'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase31WorkforceCommerceNetworkRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase31WorkforceCommerceNetworkRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase31WorkforceCommerceNetworkRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase31WorkforceCommerceNetworkRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase31WorkforceCommerceNetworkRecords[index]=svc.transitionRecord(data.phase31WorkforceCommerceNetworkRecords[index],action); store.write(data); return data.phase31WorkforceCommerceNetworkRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase31WorkforceCommerceNetworkRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase31WorkforceCommerceNetworkRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase31WorkforceCommerceNetworkRepository };
