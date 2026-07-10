const { sendJson } = require('../utils/http');
function tenant(req){return req.context.tenantId;} function repo(req){return req.context.repositories.dataGovernance;}
function filters(req){return {entityType:req.body.entityType||'',entityId:req.body.entityId||'',status:req.body.status||'',result:req.body.result||''};}
function wrap(p,res,status=200){Promise.resolve(p).then(data=>sendJson(res,status,{data})).catch(err=>sendJson(res,err.status||500,{error:{code:err.code||'error',message:err.message,details:err.details||{}}}));}
module.exports={
 listClassificationPolicies(req,res){wrap(repo(req).listClassificationPolicies(tenant(req),filters(req)),res);}, createClassificationPolicy(req,res){wrap(repo(req).createClassificationPolicy(tenant(req),req.body),res,201);},
 listRetentionPolicies(req,res){wrap(repo(req).listRetentionPolicies(tenant(req),filters(req)),res);}, createRetentionPolicy(req,res){wrap(repo(req).createRetentionPolicy(tenant(req),req.body),res,201);},
 listLegalHolds(req,res){wrap(repo(req).listLegalHolds(tenant(req),filters(req)),res);}, createLegalHold(req,res){wrap(repo(req).createLegalHold(tenant(req),req.body),res,201);},
 releaseLegalHold(req,res,id){Promise.resolve(repo(req).releaseLegalHold(tenant(req),id,req.body)).then(data=>data?sendJson(res,200,{data}):sendJson(res,404,{error:{code:'not_found',message:'Legal hold not found'}}));},
 evaluateRetention(req,res){wrap(repo(req).evaluateRetention(tenant(req),req.body),res);}, planPurgeJob(req,res){wrap(repo(req).planPurgeJob(tenant(req),req.body),res,201);}, listPurgeJobs(req,res){wrap(repo(req).listPurgeJobs(tenant(req),filters(req)),res);},
 approvePurgeJob(req,res,id){Promise.resolve(repo(req).approvePurgeJob(tenant(req),id,req.body.approvedBy||req.context.userId||'')).then(data=>data?sendJson(res,200,{data}):sendJson(res,404,{error:{code:'not_found',message:'Purge job not found'}}));},
 completePurgeJob(req,res,id){Promise.resolve(repo(req).completePurgeJob(tenant(req),id,req.body)).then(data=>data?sendJson(res,200,{data}):sendJson(res,404,{error:{code:'not_found',message:'Purge job not found'}}));},
 recordDecision(req,res){wrap(repo(req).recordDecision(tenant(req),req.body),res,201);}, listDecisions(req,res){wrap(repo(req).listDecisions(tenant(req),filters(req)),res);}
};
