const { sendJson } = require('../utils/http');
function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.aiDispatch; }
function filters(req) { return { jobId: req.body.jobId || '', status: req.body.status || '' }; }
function listRequests(req,res) { Promise.resolve(repo(req).listRequests(tenant(req),filters(req))).then(data=>sendJson(res,200,{data})); }
function createRequest(req,res) { Promise.resolve(repo(req).createRequest(tenant(req),req.body)).then(data=>sendJson(res,201,{data})).catch(err=>sendJson(res,err.status||500,{error:{code:err.code||'error',message:err.message,details:err.details||{}}})); }
function generateRecommendation(req,res) { Promise.resolve(repo(req).generateRecommendation(tenant(req),req.body)).then(data=>data?sendJson(res,201,{data}):sendJson(res,404,{error:{code:'not_found',message:'AI dispatch request not found'}})).catch(err=>sendJson(res,err.status||500,{error:{code:err.code||'error',message:err.message,details:err.details||{}}})); }
function listRecommendations(req,res) { Promise.resolve(repo(req).listRecommendations(tenant(req),filters(req))).then(data=>sendJson(res,200,{data})); }
function getRecommendation(req,res,id) { Promise.resolve(repo(req).findRecommendationById(tenant(req),id)).then(data=>data?sendJson(res,200,{data}):sendJson(res,404,{error:{code:'not_found',message:'AI dispatch recommendation not found'}})); }
function acceptRecommendation(req,res,id) { Promise.resolve(repo(req).acceptRecommendation(tenant(req),id,{...req.body,acceptedBy:req.body.acceptedBy||req.context.userId||''})).then(data=>data?sendJson(res,200,{data}):sendJson(res,404,{error:{code:'not_found',message:'AI dispatch recommendation not found'}})).catch(err=>sendJson(res,err.status||500,{error:{code:err.code||'error',message:err.message,details:err.details||{}}})); }
function rejectRecommendation(req,res,id) { Promise.resolve(repo(req).rejectRecommendation(tenant(req),id,req.body)).then(data=>data?sendJson(res,200,{data}):sendJson(res,404,{error:{code:'not_found',message:'AI dispatch recommendation not found'}})); }
module.exports = { listRequests, createRequest, generateRecommendation, listRecommendations, getRecommendation, acceptRecommendation, rejectRecommendation };
