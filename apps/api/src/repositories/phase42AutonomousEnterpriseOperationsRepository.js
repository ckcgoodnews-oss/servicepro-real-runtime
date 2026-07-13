const { makeId, now } = require('../services/id');
const svc = require('../services/phase42AutonomousEnterpriseOperationsService');
function createPhase42AutonomousEnterpriseOperationsRepository(store) {
  function ensure(data) { data.phase42AutonomousEnterpriseOperationsRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase42'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase42AutonomousEnterpriseOperationsRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase42AutonomousEnterpriseOperationsRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase42AutonomousEnterpriseOperationsRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase42AutonomousEnterpriseOperationsRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase42AutonomousEnterpriseOperationsRecords[index]=svc.transitionRecord(data.phase42AutonomousEnterpriseOperationsRecords[index],action); store.write(data); return data.phase42AutonomousEnterpriseOperationsRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase42AutonomousEnterpriseOperationsRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase42AutonomousEnterpriseOperationsRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase42AutonomousEnterpriseOperationsRepository };
