'use strict';
const express=require('express'); function createGeneralAvailabilityRouter({controller}){const router=express.Router();router.post('/cutover/evaluate',controller.evaluateCutover);router.post('/post-cutover/validate',controller.validatePostCutover);return router;} module.exports={createGeneralAvailabilityRouter};
