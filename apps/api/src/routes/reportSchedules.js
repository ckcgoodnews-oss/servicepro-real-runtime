const { sendJson }=require('../utils/http');
const { operationalTenant }=require('../services/tenantResolver');
const tenant=req=>operationalTenant(req);const repo=req=>req.context.repositories.reportSchedules;const fail=(res,error)=>sendJson(res,error.status||500,{error:{code:error.code||'error',message:error.message,details:error.details||{}}});
function list(req,res){Promise.resolve(repo(req).list(tenant(req))).then(data=>sendJson(res,200,{data})).catch(error=>fail(res,error));}
function create(req,res){Promise.resolve(repo(req).create(tenant(req),req.body)).then(data=>sendJson(res,201,{data})).catch(error=>fail(res,error));}
function update(req,res,id){Promise.resolve(repo(req).update(tenant(req),id,req.body)).then(data=>data?sendJson(res,200,{data}):sendJson(res,404,{error:{code:'not_found',message:'Report schedule not found'}})).catch(error=>fail(res,error));}
function remove(req,res,id){Promise.resolve(repo(req).remove(tenant(req),id)).then(deleted=>deleted?sendJson(res,204,{}):sendJson(res,404,{error:{code:'not_found',message:'Report schedule not found'}})).catch(error=>fail(res,error));}
module.exports={list,create,update,remove};
