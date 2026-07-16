'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiUrl, readSession } from '@/auth/session';

type Health = { ok:boolean; app:string; version:string; environment:string; store:string; uptimeSeconds:number; timestamp:string };
type Readiness = { ready:boolean; checks:Record<string,boolean>; timestamp:string };
type StatusState = { health:Health|null; readiness:Readiness|null; latencyMs:number|null; checkedAt:string; error:string };

const initial:StatusState={health:null,readiness:null,latencyMs:null,checkedAt:'',error:''};
const displayTime=(value:string)=>value?new Date(value).toLocaleString():'Not checked';
const displayUptime=(seconds:number)=>seconds<60?`${seconds}s`:seconds<3600?`${Math.floor(seconds/60)}m`:`${Math.floor(seconds/3600)}h ${Math.floor((seconds%3600)/60)}m`;

function deploymentTarget(hostname:string){
  if(hostname==='localhost'||hostname==='127.0.0.1')return 'Local development';
  if(hostname.endsWith('.onrender.com'))return 'Render online alpha';
  if(hostname.endsWith('.pages.dev'))return 'Cloudflare Pages';
  return 'Hosted application';
}

export function SystemStatusWorkspace(){
  const [status,setStatus]=useState<StatusState>(initial);
  const [checking,setChecking]=useState(false);
  const [copied,setCopied]=useState(false);
  const [session,setSession]=useState<ReturnType<typeof readSession>>(null);
  const [client,setClient]=useState({origin:'',target:'Application',online:true});
  const browserOrigin=client.origin;
  const apiOrigin=apiUrl('').replace(/\/$/,'');
  const target=client.target;

  const check=useCallback(async()=>{
    setChecking(true);setCopied(false);const started=performance.now();
    try{
      const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),8000);
      const [healthResponse,readinessResponse]=await Promise.all([fetch(apiUrl('/healthz'),{signal:controller.signal}),fetch(apiUrl('/readyz'),{signal:controller.signal})]);
      window.clearTimeout(timeout);
      if(!healthResponse.ok||!readinessResponse.ok)throw new Error(`API returned ${healthResponse.status}/${readinessResponse.status}`);
      const [health,readiness]=await Promise.all([healthResponse.json(),readinessResponse.json()]);
      setStatus({health,readiness,latencyMs:Math.round(performance.now()-started),checkedAt:new Date().toISOString(),error:''});
    }catch(problem){
      const message=problem instanceof DOMException&&problem.name==='AbortError'?'API check timed out after 8 seconds':problem instanceof Error?problem.message:'API check failed';
      setStatus(current=>({...current,health:null,readiness:null,latencyMs:null,checkedAt:new Date().toISOString(),error:message}));
    }finally{setChecking(false);}
  },[]);

  useEffect(()=>{
    const syncClient=()=>setClient({origin:window.location.origin,target:deploymentTarget(window.location.hostname),online:navigator.onLine});
    const syncSession=()=>setSession(readSession());
    setSession(readSession());syncClient();check();
    window.addEventListener('online',syncClient);window.addEventListener('offline',syncClient);window.addEventListener('servicepro:session',syncSession);
    return()=>{window.removeEventListener('online',syncClient);window.removeEventListener('offline',syncClient);window.removeEventListener('servicepro:session',syncSession);};
  },[check]);

  async function copyDiagnostics(){
    const report=[`ServicePro system status`,`Website: ${browserOrigin}`,`API: ${apiOrigin}`,`Target: ${target}`,`API status: ${status.health?.ok?'Online':'Unavailable'}`,`Version: ${status.health?.version||'Unknown'}`,`Environment: ${status.health?.environment||'Unknown'}`,`Store: ${status.health?.store||'Unknown'}`,`Latency: ${status.latencyMs===null?'Unknown':`${status.latencyMs}ms`}`,`Checked: ${status.checkedAt||'Not checked'}`].join('\n');
    await navigator.clipboard.writeText(report);setCopied(true);
  }

  const online=status.health?.ok===true&&status.readiness?.ready===true;
  return <section className="system-status-workspace">
    <div className={`system-status-hero panel ${online?'online':status.error?'offline':'checking'}`}>
      <div><p className="eyebrow"><span/> Deployment diagnostics</p><h2>{checking?'Checking services…':online?'All connected':'Connection needs attention'}</h2><p>{checking?'Contacting the ServicePro API and readiness endpoints.':online?'The website, API, runtime configuration, and authenticated workspace are available.':status.error||'Run a connection check to verify this deployment.'}</p></div>
      <div className="system-status-actions"><span><i/>{checking?'Checking':online?'Operational':'Unavailable'}</span><button className="button button-small" type="button" onClick={check} disabled={checking}>{checking?'Checking…':'Run check'}</button></div>
    </div>
    <div className="status-card-grid" aria-live="polite">
      <article className="panel"><small>Website</small><strong>{target}</strong><span>{browserOrigin||'Browser origin unavailable'}</span><i className="status-good">Connected</i></article>
      <article className="panel"><small>API</small><strong>{status.health?.app||'ServicePro API'}</strong><span>{apiOrigin}</span><i className={status.health?.ok?'status-good':'status-bad'}>{status.health?.ok?'Online':'Unavailable'}</i></article>
      <article className="panel"><small>Workspace session</small><strong>{session?.user.name||session?.user.email||'No active session'}</strong><span>{session?.user.tenantId||'Sign in required'}</span><i className={session?.accessToken?'status-good':'status-bad'}>{session?.accessToken?'Authenticated':'Signed out'}</i></article>
      <article className="panel"><small>Round-trip time</small><strong>{status.latencyMs===null?'—':`${status.latencyMs} ms`}</strong><span>Website to API</span><i className={status.latencyMs!==null&&status.latencyMs<1500?'status-good':'status-neutral'}>{status.latencyMs===null?'Not measured':status.latencyMs<400?'Fast':status.latencyMs<1500?'Normal':'Slow'}</i></article>
    </div>
    <div className="status-detail-grid">
      <section className="panel"><div className="panel-heading"><div><h2>Runtime</h2><p>Safe deployment information reported by the API.</p></div></div><dl><div><dt>Version</dt><dd>{status.health?.version||'Unknown'}</dd></div><div><dt>Environment</dt><dd>{status.health?.environment||'Unknown'}</dd></div><div><dt>Data store</dt><dd>{status.health?.store||'Unknown'}</dd></div><div><dt>API uptime</dt><dd>{status.health?displayUptime(status.health.uptimeSeconds):'Unknown'}</dd></div><div><dt>Browser network</dt><dd>{client.online?'Online':'Offline'}</dd></div><div><dt>Last checked</dt><dd>{displayTime(status.checkedAt)}</dd></div></dl>{status.health?.store==='json'&&<p className="status-warning"><strong>Testing data only.</strong> This alpha uses temporary JSON storage; information can reset after a redeploy.</p>}</section>
      <section className="panel"><div className="panel-heading"><div><h2>Readiness checks</h2><p>Conditions required before testing the workspace.</p></div></div><div className="readiness-list"><article><span><i className={status.health?.ok?'good':'bad'}/><strong>API health</strong><small>The public health endpoint responds successfully.</small></span><b>{status.health?.ok?'Pass':'Fail'}</b></article>{Object.entries(status.readiness?.checks||{configuration:false,runtime:false}).map(([name,passed])=><article key={name}><span><i className={passed?'good':'bad'}/><strong>{name.slice(0,1).toUpperCase()+name.slice(1)}</strong><small>{name==='configuration'?'Required runtime settings are available.':'The API process can serve requests.'}</small></span><b>{passed?'Pass':'Fail'}</b></article>)}<article><span><i className={session?.accessToken?'good':'bad'}/><strong>Authenticated session</strong><small>The browser has an active ServicePro access token.</small></span><b>{session?.accessToken?'Pass':'Fail'}</b></article></div><button className="text-button status-copy" type="button" onClick={copyDiagnostics} disabled={!status.checkedAt}>{copied?'Diagnostics copied':'Copy safe diagnostics'}</button></section>
    </div>
  </section>;
}
