const { makeId, now }=require('../services/id');
const svc=require('../services/phase13EnterpriseAnalyticsService');
function createPhase13EnterpriseanalyticsRepository(store){
 function ensure(data){data.phase13EnterpriseAnalyticsRecords||=[];return data;}
 return {store,create(input){const d=ensure(store.read());const row={id:makeId('phase13enterpriseanalytics'),...svc.normalizeRecord(input),createdAt:now(),updatedAt:now()};d.phase13EnterpriseAnalyticsRecords.push(row);store.write(d);return row;},list(filters={}){return ensure(store.read()).phase13EnterpriseAnalyticsRecords.filter(x=>!filters.tenantId||x.tenantId===filters.tenantId).filter(x=>!filters.domain||x.domain===filters.domain);},get(id){return ensure(store.read()).phase13EnterpriseAnalyticsRecords.find(x=>x.id===id)||null;},transition(id,action){const d=ensure(store.read());const i=d.phase13EnterpriseAnalyticsRecords.findIndex(x=>x.id===id);if(i<0)return null;d.phase13EnterpriseAnalyticsRecords[i]=svc.transitionRecord(d.phase13EnterpriseAnalyticsRecords[i],action);store.write(d);return d.phase13EnterpriseAnalyticsRecords[i];},metrics(tenantId){return svc.metrics(ensure(store.read()).phase13EnterpriseAnalyticsRecords.filter(x=>!tenantId||x.tenantId===tenantId));}};
}
module.exports={createPhase13EnterpriseanalyticsRepository};
