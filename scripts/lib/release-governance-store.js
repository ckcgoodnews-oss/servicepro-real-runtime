'use strict';
const fs=require('node:fs');const path=require('node:path');
function readJson(p){if(!fs.existsSync(p))return null;return JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''))}
function writeJson(p,v){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,`${JSON.stringify(v,null,2)}\n`,'utf8')}
module.exports={readJson,writeJson};
