'use strict';
function createGeneralAvailabilityController({service}){return{evaluateCutover:async(req,res,next)=>{try{const r=await service.evaluateCutover(req.body||{});res.status(r.authorized?200:409).json(r);}catch(e){next(e);}},validatePostCutover:async(req,res,next)=>{try{const r=await service.validatePostCutover(req.body||{});res.status(r.validated?200:409).json(r);}catch(e){next(e);}}};}
module.exports={createGeneralAvailabilityController};
