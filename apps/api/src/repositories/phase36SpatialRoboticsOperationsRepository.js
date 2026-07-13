const { makeId, now } = require('../services/id');
const svc = require('../services/phase36SpatialRoboticsOperationsService');
function createPhase36spatialroboticsoperationsRepository(store) {
  function ensure(data) { data.phase36SpatialRoboticsOperationsRecords ||= []; return data; }
  return {
    store,
    create(input) { const data=ensure(store.read()); const row={id:makeId('phase36'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()}; data.phase36SpatialRoboticsOperationsRecords.push(row); store.write(data); return row; },
    list(filters={}) { return ensure(store.read()).phase36SpatialRoboticsOperationsRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain); },
    get(id) { return ensure(store.read()).phase36SpatialRoboticsOperationsRecords.find(x=>x.id===id)||null; },
    transition(id,action) { const data=ensure(store.read()); const index=data.phase36SpatialRoboticsOperationsRecords.findIndex(x=>x.id===id); if(index<0)return null; data.phase36SpatialRoboticsOperationsRecords[index]=svc.transitionRecord(data.phase36SpatialRoboticsOperationsRecords[index],action); store.write(data); return data.phase36SpatialRoboticsOperationsRecords[index]; },
    metrics(tenantId) { return svc.metrics(ensure(store.read()).phase36SpatialRoboticsOperationsRecords.filter(x=>!tenantId||x.tenantId===tenantId)); },
    releaseReady(tenantId) { return svc.releaseReady(ensure(store.read()).phase36SpatialRoboticsOperationsRecords.filter(x=>!tenantId||x.tenantId===tenantId)); }
  };
}
module.exports={ createPhase36spatialroboticsoperationsRepository };
