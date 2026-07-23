'use client';

import {FormEvent, useCallback, useEffect, useState} from 'react';
import {authFetch} from '@/auth/session';

type TeamUser={id:string;name?:string;email:string;roles:string[];modulePermissions:string[]};
type TeamData={users:TeamUser[];enabledModules:string[]};
const roles=['admin','manager','technician','billing','read_only'];

export function TeamManagementWorkspace(){
  const[data,setData]=useState<TeamData>({users:[],enabledModules:[]});
  const[error,setError]=useState('');const[creating,setCreating]=useState(false);
  const load=useCallback(async()=>{try{const response=await authFetch('/api/v1/team'),body=await response.json();if(!response.ok)throw new Error(body.error?.message||'Unable to load team');setData(body.data);setError('');}catch(problem){setError(problem instanceof Error?problem.message:'Unable to load team');}},[]);
  useEffect(()=>{void load();},[load]);
  function patchUser(id:string,patch:Partial<TeamUser>){setData(current=>({...current,users:current.users.map(user=>user.id===id?{...user,...patch}:user)}));}
  function toggle(user:TeamUser,moduleName:string,checked:boolean){const current=user.modulePermissions||[];patchUser(user.id,{modulePermissions:checked?[...new Set([...current,moduleName])]:current.filter(value=>value!==moduleName)});}
  async function save(user:TeamUser){const response=await authFetch(`/api/v1/team/${user.id}`,{method:'PATCH',body:JSON.stringify({roles:user.roles,modules:user.modulePermissions})});const body=await response.json();if(!response.ok){setError(body.error?.message||'Unable to save access');return;}await load();}
  async function create(event:FormEvent<HTMLFormElement>){event.preventDefault();setCreating(true);const form=new FormData(event.currentTarget);const response=await authFetch('/api/v1/team',{method:'POST',body:JSON.stringify({name:form.get('name'),email:form.get('email'),password:form.get('password'),roles:[form.get('role')],modules:form.getAll('modules')})});const body=await response.json();setCreating(false);if(!response.ok){setError(body.error?.message||'Unable to add team member');return;}event.currentTarget.reset();await load();}
  return <div className="team-management-grid">
    <section className="panel team-create"><div className="panel-heading"><div><h2>Add team member</h2><p>Create an employee login and grant only approved modules.</p></div></div><form onSubmit={create}><div className="form-columns"><label>Full name<input name="name" required/></label><label>Email<input name="email" type="email" required/></label></div><div className="form-columns"><label>Role<select name="role" defaultValue="technician">{roles.map(role=><option value={role} key={role}>{role.replace('_',' ')}</option>)}</select></label><label>Temporary password<input name="password" type="password" minLength={12} required/></label></div><fieldset><legend>Module access</legend>{data.enabledModules.map(moduleName=><label key={moduleName}><input type="checkbox" name="modules" value={moduleName}/>{moduleName}</label>)}</fieldset><button className="button button-small" disabled={creating}>{creating?'Adding…':'Add team member'}</button></form></section>
    <section className="panel"><div className="panel-heading"><div><h2>Team access</h2><p>Roles and modules are limited to this workspace.</p></div></div>{error&&<p className="form-error">{error}</p>}<div className="team-list">{data.users.map(user=><article key={user.id}><div><strong>{user.name||user.email}</strong><small>{user.email}</small></div><select value={user.roles?.[0]||'technician'} onChange={event=>patchUser(user.id,{roles:[event.target.value]})}>{roles.map(role=><option value={role} key={role}>{role.replace('_',' ')}</option>)}</select><div className="team-module-list">{data.enabledModules.map(moduleName=><label key={moduleName}><input type="checkbox" checked={(user.modulePermissions||[]).includes(moduleName)} onChange={event=>toggle(user,moduleName,event.target.checked)}/>{moduleName}</label>)}</div><button className="button button-small" onClick={()=>void save(user)}>Save access</button></article>)}</div></section>
  </div>;
}
