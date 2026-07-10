const express=require('express');
const { read }=require('../db/store');
const router=express.Router();
router.get('/healthz',(req,res)=>res.json({ok:true, service:'servicepro', version:'1.0.0'}));
router.get('/readyz',(req,res)=>{ try{ const db=read(); res.json({ok:true, tenants:db.tenants.length}); }catch(e){ res.status(503).json({ok:false,error:e.message}); }});
module.exports=router;
