const {sendJson}=require('../utils/http');const {operationalTenant}=require('../services/tenantResolver');const {calculateSubscriberCommerceReadiness}=require('../services/subscriberCommerceReadinessService');
function get(req,res){Promise.resolve(calculateSubscriberCommerceReadiness(req.context.repositories,operationalTenant(req))).then(data=>sendJson(res,200,{data})).catch(error=>sendJson(res,error.status||500,{error:{code:error.code||'readiness_failed',message:error.message}}));}
module.exports={get};
