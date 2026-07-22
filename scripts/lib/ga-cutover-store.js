'use strict';
const fs=require('node:fs'); const path=require('node:path');
function readJson(filePath,fallback=null){if(!fs.existsSync(filePath))return fallback; return JSON.parse(fs.readFileSync(filePath,'utf8').replace(/^\uFEFF/,''));}
function writeJson(filePath,value){fs.mkdirSync(path.dirname(filePath),{recursive:true});fs.writeFileSync(filePath,`${JSON.stringify(value,null,2)}\n`,'utf8');}
module.exports={readJson,writeJson};
