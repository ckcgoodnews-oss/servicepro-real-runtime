#!/usr/bin/env node
'use strict';
const path=require('node:path'); const {evaluateGeneralAvailabilityCutover}=require('./lib/ga-cutover-engine'); const {readJson,writeJson}=require('./lib/ga-cutover-store');
const allowBlocked=process.argv.includes('--allow-blocked'), root=path.resolve(__dirname,'..');
const inputPath=path.resolve(root,process.env.GA_CUTOVER_INPUT_PATH||'release-evidence/ga-cutover-input.json');
const policyPath=path.resolve(root,process.env.GA_CUTOVER_POLICY_PATH||'config/production/ga-cutover-policy.json');
const outputPath=path.resolve(root,process.env.GA_CUTOVER_REPORT_PATH||'release-evidence/ga-cutover-report.json');
const input=readJson(inputPath,{releaseId:'local-verification',steps:[],approvals:[],readinessCertificate:null}); const policy=readJson(policyPath,{});
const report=evaluateGeneralAvailabilityCutover({...input,policy}); writeJson(outputPath,report); process.stdout.write(`${JSON.stringify({inputPath,outputPath,report},null,2)}\n`); if(!report.authorized&&!allowBlocked)process.exitCode=12;
