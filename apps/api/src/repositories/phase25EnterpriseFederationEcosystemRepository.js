const { makeId, now } = require('../services/id');
const svc = require('../services/phase25EnterpriseFederationEcosystemService');
function createPhase25EnterpriseFederationEcosystemRepository(store) {
  function ensure(data) { data.phase25EnterpriseFederationEcosystemRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase25EnterpriseFederationEcosystem'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase25EnterpriseFederationEcosystemRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase25EnterpriseFederationEcosystemRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase25EnterpriseFederationEcosystemRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase25EnterpriseFederationEcosystemRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase25EnterpriseFederationEcosystemRecords[index]=svc.transitionRecord(data.phase25EnterpriseFederationEcosystemRecords[index],action); store.write(data); return data.phase25EnterpriseFederationEcosystemRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase25EnterpriseFederationEcosystemRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase25EnterpriseFederationEcosystemRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase25EnterpriseFederationEcosystemRepository };
