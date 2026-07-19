#!/usr/bin/env node
'use strict';
const path=require('node:path');const {verifyLedgerFile}=require('./lib/release-authorization-ledger');const allowEmpty=process.argv.includes('--allow-empty'),root=path.resolve(__dirname,'..'),ledgerPath=path.resolve(root,process.env.RELEASE_AUTHORIZATION_LEDGER_PATH||path.join('release-evidence','release-authorization-ledger.jsonl')),r=verifyLedgerFile(ledgerPath);console.log(JSON.stringify({ledgerPath,...r},null,2));if(!r.valid||(!allowEmpty&&r.entryCount===0))process.exitCode=5;
