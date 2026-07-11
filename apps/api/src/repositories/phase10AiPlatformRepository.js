const { makeId, now }=require('../services/id');
const svc=require('../services/phase10AiPlatformService');
function createPhase10AiplatformRepository(store){
 function ensure(data){data.phase10AiPlatformRecords||=[];return data;}
 return {store,create(input){const d=ensure(store.read());const row={id:makeId('phase10aiplatform'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()};d.phase10AiPlatformRecords.push(row);store.write(d);return row;},list(filters={}){return ensure(store.read()).phase10AiPlatformRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain);},get(id){return ensure(store.read()).phase10AiPlatformRecords.find(x=>x.id===id)||null;},transition(id,action){const d=ensure(store.read());const i=d.phase10AiPlatformRecords.findIndex(x=>x.id===id);if(i<0)return null;d.phase10AiPlatformRecords[i]=svc.transitionRecord(d.phase10AiPlatformRecords[i],action);store.write(d);return d.phase10AiPlatformRecords[i];},metrics(tenantId){return svc.metrics(ensure(store.read()).phase10AiPlatformRecords.filter(x=>!tenantId||x.tenantId===tenantId));}};
}
module.exports={createPhase10AiplatformRepository};
