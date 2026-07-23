'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { authFetch } from '@/auth/session';

type WorkItem = { id:string; title:string; status:string; priority:string; customer:string; updatedAt:string };
type Dashboard = { generatedAt:string; kpis:{openWork:number;appointmentsToday:number;customers:number;outstanding:number}; attention:WorkItem[]; recentWork:WorkItem[]; notifications:{id:string;subject:string;status:string;createdAt:string}[]; activity:{id:string;eventType:string;action:string;entityType:string;createdAt:string}[] };

const fallback: Dashboard = { generatedAt:'',kpis:{openWork:0,appointmentsToday:0,customers:0,outstanding:0},attention:[],recentWork:[],notifications:[],activity:[] };
const money = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
const relative = (value:string) => { const minutes=Math.max(0,Math.round((Date.now()-Date.parse(value))/60000)); return minutes < 60 ? `${minutes}m ago` : minutes < 1440 ? `${Math.round(minutes/60)}h ago` : `${Math.round(minutes/1440)}d ago`; };

export function DashboardOverview() {
  const [data,setData]=useState(fallback); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
  useEffect(() => { authFetch('/api/v1/dashboard/summary').then(async response => { const body=await response.json(); if(!response.ok) throw new Error(body.error?.message || 'Dashboard unavailable'); setData(body.data); }).catch(problem => setError(problem instanceof Error ? problem.message : 'Dashboard unavailable')).finally(() => setLoading(false)); },[]);
  const cards = [['Open work',String(data.kpis.openWork),'Active jobs'],['Appointments today',String(data.kpis.appointmentsToday),'Scheduled visits'],['Active customers',String(data.kpis.customers),'Tenant total'],['Outstanding',money.format(data.kpis.outstanding),'Invoice balance']];
  if (loading) return <section className="dashboard-loading" aria-live="polite">Loading today’s operation…</section>;
  return <>{error && <p className="dashboard-error" role="alert">{error}</p>}<section className="kpi-grid" aria-label="Key performance indicators">{cards.map(([label,value,helper]) => <article key={label}><span>{label}</span><strong>{value}</strong><small>{helper}</small></article>)}</section>
    <div className="dashboard-grid"><section className="panel attention-panel"><div className="panel-heading"><div><h2>Needs attention</h2><p>Open work ordered by priority.</p></div><Link href="/dashboard">View all →</Link></div>{data.attention.length ? data.attention.map((item,index) => <article className="attention-row" key={item.id}><span className={`priority p${Math.min(index,2)}`}>{item.priority}</span><div><strong>{item.title}</strong><p>{item.customer}</p></div><small>{item.status} · {relative(item.updatedAt)}</small><button type="button" aria-label={`Open ${item.title}`}>→</button></article>) : <p className="empty-state">No open work needs attention.</p>}</section>
    <section className="panel quick-panel"><div className="panel-heading"><div><h2>Quick actions</h2><p>Keep the day moving.</p></div></div><div className="quick-grid"><button type="button">+ New work order</button><button type="button">Open schedule</button><button type="button">Add customer</button><button type="button">Run report</button></div><h3>Favorites</h3><div className="favorite-links"><Link href="/dashboard">Dispatch board</Link><Link href="/dashboard">Outstanding invoices</Link><Link href="/dashboard">Asset history</Link></div></section></div>
    <div className="dashboard-grid lower-grid"><section className="panel"><div className="panel-heading"><div><h2>Recent work</h2><p>Latest tenant activity.</p></div></div><div className="compact-list">{data.recentWork.map(item => <article key={item.id}><span><strong>{item.title}</strong><small>{item.customer}</small></span><em>{item.status}</em><time>{relative(item.updatedAt)}</time></article>)}</div></section><section className="panel"><div className="panel-heading"><div><h2>Activity & notifications</h2><p>What changed most recently.</p></div></div><div className="compact-list">{[...data.notifications.map(item => ({id:item.id,title:item.subject,meta:item.status,at:item.createdAt})),...data.activity.map(item => ({id:item.id,title:item.action || item.eventType,meta:item.entityType || 'system',at:item.createdAt}))].sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)).slice(0,5).map(item => <article key={`${item.id}-${item.at}`}><span><strong>{item.title}</strong><small>{item.meta}</small></span><time>{relative(item.at)}</time></article>)}</div></section></div>
  </>;
}
