'use client';

import { useMemo, useState } from 'react';

type DocKind = 'guide' | 'tutorial' | 'api' | 'release';
type DocEntry = { id: string; kind: DocKind; category: string; title: string; summary: string; minutes: number; updated: string; sections: { heading: string; body: string; code?: string; steps?: string[] }[] };

const docs: DocEntry[] = [
  { id:'getting-started',kind:'guide',category:'Getting started',title:'Set up your service workspace',summary:'Configure your company, locations, teams, service catalog, and operating preferences.',minutes:8,updated:'July 2026',sections:[
    {heading:'Build the organization',body:'Start in Organization. Add business units only when reporting or operating rules differ, then add departments, locations, and technician teams beneath them.'},
    {heading:'Choose your service model',body:'Open Marketplace and install the packs that match your trades. Core customers, scheduling, dispatch, billing, assets, and reporting stay consistent across every service industry.'},
    {heading:'Invite the team',body:'Create invitations with the least-privileged role each person needs. Owners can manage billing and security; technicians receive field-operational access.'}
  ]},
  { id:'daily-operations',kind:'guide',category:'Operations',title:'Run the daily service board',summary:'Prioritize incoming work, assign technicians, manage exceptions, and keep customers informed.',minutes:6,updated:'July 2026',sections:[
    {heading:'Review attention items',body:'Begin on Overview with overdue invoices, unassigned work, schedule conflicts, and urgent customer activity.'},
    {heading:'Dispatch work',body:'Use Work orders to switch between list, Kanban, and calendar views. Assign a qualified technician and confirm that the schedule window has no conflict.'},
    {heading:'Close the loop',body:'Move completed work through its approved status transition, verify used materials, and send the invoice and follow-up communication.'}
  ]},
  { id:'industry-packs',kind:'guide',category:'Marketplace',title:'Use service-industry packs',summary:'Add trade-specific terminology and templates without fragmenting your core operating data.',minutes:5,updated:'July 2026',sections:[
    {heading:'Universal foundation',body:'Customer records, estimates, work orders, schedules, invoices, assets, and reports use a shared model for all service businesses.'},
    {heading:'Install only what applies',body:'Filter Marketplace by industry and install one or more packs. Multi-trade companies can combine packs in the same tenant.'},
    {heading:'Safe expansion',body:'New catalog packs appear automatically. Existing installations and tenant data remain unchanged when the catalog grows.'}
  ]},
  { id:'first-work-order',kind:'tutorial',category:'Work orders',title:'Create and dispatch your first work order',summary:'A guided path from customer request to a scheduled technician visit.',minutes:10,updated:'July 2026',sections:[
    {heading:'Tutorial',body:'Complete these steps in order.',steps:['Open Customers and select or create the service customer.','Create a work order with a clear outcome-focused title, priority, and service address.','Add the requested service and any known customer asset.','Choose a schedule window and assign a qualified technician.','Review the calendar for conflicts, then confirm the appointment.','Send the appointment confirmation from Notifications.']}
  ]},
  { id:'recurring-service',kind:'tutorial',category:'Scheduling',title:'Build a recurring service program',summary:'Turn preventive maintenance or repeat cleaning into a consistent operating cadence.',minutes:9,updated:'July 2026',sections:[
    {heading:'Tutorial',body:'Use this workflow for HVAC maintenance, pest routes, cleaning plans, pool service, landscaping, and similar repeat work.',steps:['Install the relevant service-industry pack.','Define the recurring service and standard visit checklist.','Create the customer asset or property area being maintained.','Set the service frequency and preferred visit window.','Assign the appropriate team or territory.','Review upcoming workload and notify the customer before each visit.']}
  ]},
  { id:'report-schedule',kind:'tutorial',category:'Reporting',title:'Schedule an operations report',summary:'Deliver a recurring CSV summary to managers without manual exports.',minutes:4,updated:'July 2026',sections:[
    {heading:'Tutorial',body:'Scheduled delivery uses tenant-scoped report definitions.',steps:['Open Reports and select the operational or financial report.','Verify the current filters and totals.','Choose Schedule delivery.','Select daily, weekly, or monthly frequency and CSV format.','Add approved recipients and save the schedule.','Use Download history to audit generated exports.']}
  ]},
  { id:'api-auth',kind:'api',category:'API basics',title:'Authentication and request format',summary:'Call tenant-aware ServicePro APIs with an access token and JSON payloads.',minutes:7,updated:'July 2026',sections:[
    {heading:'Bearer authentication',body:'Send the access token issued by the login flow in the Authorization header. Authorization and tenant scope are enforced on the server.',code:"curl -H \"Authorization: Bearer $SERVICEPRO_TOKEN\" \\\n  -H \"Content-Type: application/json\" \\\n  https://api.example.com/api/v1/dashboard/summary"},
    {heading:'Response envelope',body:'Successful responses return product data under data. Errors include a stable code and a safe message.',code:'{\n  "data": { "openWorkOrders": 12 }\n}'}
  ]},
  { id:'api-work-orders',kind:'api',category:'Endpoints',title:'Work orders API',summary:'List tenant work, update assignments, and apply validated status transitions.',minutes:8,updated:'July 2026',sections:[
    {heading:'List work orders',body:'Retrieve work orders visible to the authenticated tenant.',code:'GET /api/v1/jobs'},
    {heading:'Schedule a technician',body:'Appointments validate tenant ownership and scheduling conflicts.',code:'POST /api/v1/appointments\n{\n  "jobId": "job_123",\n  "technicianId": "tech_456",\n  "startTime": "2026-07-16T13:00:00Z",\n  "endTime": "2026-07-16T15:00:00Z"\n}'},
    {heading:'Transition status',body:'Use the transition endpoint instead of directly replacing status so configured rules and audit events are applied.',code:'POST /api/v1/jobs/{jobId}/transition\n{ "status": "scheduled" }'}
  ]},
  { id:'api-marketplace',kind:'api',category:'Endpoints',title:'Marketplace API',summary:'Read the catalog and manage tenant-isolated installations.',minutes:5,updated:'July 2026',sections:[
    {heading:'Catalog',body:'Returns published service packs, connectors, extensions, and themes.',code:'GET /api/v1/app-marketplace'},
    {heading:'Install an item',body:'Creates one installation per tenant and catalog item.',code:'POST /api/v1/app-marketplace/installations\n{ "itemId": "market_hvac" }'},
    {heading:'Remove an installation',body:'Only an installation belonging to the authenticated tenant can be removed.',code:'DELETE /api/v1/app-marketplace/installations/{installationId}'}
  ]},
  { id:'release-728',kind:'release',category:'Version 8',title:'Sprint 728 — Documentation and industry expansion',summary:'Documentation portal plus a catalog of 30 installable service-industry packs.',minutes:3,updated:'July 2026',sections:[
    {heading:'Highlights',body:'Added this searchable documentation portal with guides, tutorials, API references, and release notes.',steps:['Expanded Marketplace to 30 service industries.','Made industry filters data-driven.','Preserved existing installations during catalog upgrades.','Added JSON and PostgreSQL parity with regression coverage.']}
  ]},
  { id:'release-727',kind:'release',category:'Version 8',title:'Sprint 727 — Marketplace',summary:'Installable industry packs, connectors, extensions, and themes.',minutes:2,updated:'July 2026',sections:[
    {heading:'Highlights',body:'Introduced a protected, tenant-aware Marketplace.',steps:['Initial plumbing, HVAC, carpet cleaning, and landscaping packs.','Universal accounting and payment connectors.','Persistent installation and removal workflows.','Responsive filtering and search.']}
  ]},
  { id:'release-726',kind:'release',category:'Version 8',title:'Sprint 726 — Reporting',summary:'Operational reporting, exports, and scheduled delivery.',minutes:2,updated:'July 2026',sections:[
    {heading:'Highlights',body:'Added live revenue, work-order, inventory, and operations reporting.',steps:['Responsive charts with visible values.','Tenant-scoped CSV exports and download history.','Daily, weekly, and monthly report schedules.','Pause and resume controls.']}
  ]}
];

const labels: Record<DocKind | 'all', string> = { all:'All documentation',guide:'Guides',tutorial:'Tutorials',api:'API reference',release:'Release notes' };

export function DocumentationWorkspace() {
  const [kind,setKind]=useState<DocKind|'all'>('all');
  const [query,setQuery]=useState('');
  const [selectedId,setSelectedId]=useState('getting-started');
  const [copied,setCopied]=useState('');
  const visible=useMemo(()=>docs.filter(doc=>(kind==='all'||doc.kind===kind)&&[doc.title,doc.summary,doc.category,...doc.sections.flatMap(section=>[section.heading,section.body,...(section.steps||[])])].join(' ').toLowerCase().includes(query.toLowerCase())),[kind,query]);
  const selected=visible.find(doc=>doc.id===selectedId)||visible[0];
  async function copy(value:string,key:string){try{await navigator.clipboard.writeText(value);setCopied(key);window.setTimeout(()=>setCopied(''),1800);}catch{setCopied('');}}
  return <section className="docs-workspace">
    <div className="docs-hero"><div><span>ServicePro learning center</span><h2>Answers for every team and every trade.</h2><p>Search practical operating guides, step-by-step tutorials, authenticated API examples, and version history.</p></div><label><span aria-hidden="true">⌕</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search documentation" aria-label="Search documentation"/></label></div>
    <div className="docs-tabs" aria-label="Documentation type">{(Object.keys(labels) as (DocKind|'all')[]).map(value=><button key={value} type="button" className={kind===value?'active':''} onClick={()=>setKind(value)}>{labels[value]}<span>{value==='all'?docs.length:docs.filter(doc=>doc.kind===value).length}</span></button>)}</div>
    <div className="docs-layout"><aside className="docs-index" aria-label="Documentation articles"><p>{visible.length} {visible.length===1?'article':'articles'}</p>{visible.map(doc=><button type="button" className={selected?.id===doc.id?'active':''} key={doc.id} onClick={()=>setSelectedId(doc.id)}><span>{labels[doc.kind]}</span><strong>{doc.title}</strong><small>{doc.minutes} min · {doc.updated}</small></button>)}{!visible.length&&<div><strong>No documentation found</strong><small>Try another term or documentation type.</small></div>}</aside>
      <article className="docs-article">{selected&&<><header><span>{labels[selected.kind]} · {selected.category}</span><h2>{selected.title}</h2><p>{selected.summary}</p><small>Updated {selected.updated} · {selected.minutes} minute read</small></header>{selected.sections.map((section,index)=><section key={section.heading}><h3>{section.heading}</h3><p>{section.body}</p>{section.steps&&<ol>{section.steps.map(step=><li key={step}>{step}</li>)}</ol>}{section.code&&<div className="docs-code"><button type="button" onClick={()=>copy(section.code!,`${selected.id}-${index}`)}>{copied===`${selected.id}-${index}`?'Copied':'Copy'}</button><pre><code>{section.code}</code></pre></div>}</section>)}</>}</article>
    </div>
  </section>;
}
