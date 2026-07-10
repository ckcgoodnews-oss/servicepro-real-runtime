const express=require('express');
const bcrypt=require('bcryptjs');
const { read, write, now, id }=require('../db/store');
const router=express.Router();
router.get('/',(req,res)=>{ const db=read(); res.render('install/index',{title:'Installer Wizard', installed:db.installState.some(x=>x.key==='installed'&&x.value===true)}); });
router.post('/',async(req,res)=>{ const db=read(); if(db.installState.some(x=>x.key==='installed'&&x.value===true)){ req.flash('error','Installation is already completed.'); return res.redirect('/install'); }
 const tenantId='tenant_'+id('root').slice(-10); const userId='user_'+id('own').slice(-10); const passwordHash=await bcrypt.hash(req.body.password,10);
 db.tenants.push({id:tenantId,name:req.body.businessName,slug:String(req.body.businessName||'service-business').toLowerCase().replace(/[^a-z0-9]+/g,'-'),createdAt:now(),updatedAt:now()});
 db.users.push({id:userId,name:req.body.ownerName,email:req.body.email,passwordHash,platformRole:'installer',createdAt:now(),updatedAt:now()});
 db.tenantUsers.push({id:id('tu'),tenantId,userId,role:'owner',createdAt:now(),updatedAt:now()});
 db.installState.push({id:id('ins'),key:'installed',value:true,createdAt:now(),updatedAt:now()});
 write(db); req.flash('success','Installation completed. Please sign in.'); res.redirect('/auth/login'); });
module.exports=router;
