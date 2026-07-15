'use client';

import { useEffect, useRef, useState } from 'react';

type Preferences = { highContrast: boolean; reduceMotion: boolean };
const storageKey = 'servicepro-accessibility';

function applyPreferences(preferences: Preferences) {
  const root = document.documentElement;
  if (preferences.highContrast) root.dataset.contrast = 'high'; else delete root.dataset.contrast;
  if (preferences.reduceMotion) root.dataset.motion = 'reduce'; else delete root.dataset.motion;
}

export function AccessibilityControls() {
  const [open,setOpen]=useState(false);
  const [preferences,setPreferences]=useState<Preferences>({highContrast:false,reduceMotion:false});
  const [announcement,setAnnouncement]=useState('');
  const triggerRef=useRef<HTMLButtonElement>(null);
  const panelRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    let saved:Partial<Preferences>={};
    try{saved=JSON.parse(window.localStorage.getItem(storageKey)||'{}');}catch{}
    const next={highContrast:Boolean(saved.highContrast),reduceMotion:saved.reduceMotion??window.matchMedia('(prefers-reduced-motion: reduce)').matches};
    setPreferences(next);applyPreferences(next);
  },[]);

  useEffect(()=>{
    if(!open)return;
    panelRef.current?.focus();
    function close(event:KeyboardEvent){if(event.key==='Escape'){setOpen(false);triggerRef.current?.focus();}}
    window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);
  },[open]);

  function update(key:keyof Preferences,label:string){
    const next={...preferences,[key]:!preferences[key]};
    setPreferences(next);applyPreferences(next);window.localStorage.setItem(storageKey,JSON.stringify(next));
    setAnnouncement(`${label} ${next[key]?'enabled':'disabled'}.`);
  }

  function reset(){const next={highContrast:false,reduceMotion:false};setPreferences(next);applyPreferences(next);window.localStorage.removeItem(storageKey);setAnnouncement('Accessibility display preferences reset.');}

  return <div className="accessibility-wrap">
    <button ref={triggerRef} className="icon-button accessibility-trigger" type="button" aria-label="Accessibility settings" aria-expanded={open} aria-controls="accessibility-panel" onClick={()=>setOpen(value=>!value)}><span aria-hidden="true">Aa</span></button>
    {open&&<div ref={panelRef} id="accessibility-panel" className="accessibility-panel" role="dialog" aria-modal="false" aria-labelledby="accessibility-title" tabIndex={-1}>
      <div><strong id="accessibility-title">Accessibility</strong><button type="button" aria-label="Close accessibility settings" onClick={()=>{setOpen(false);triggerRef.current?.focus();}}>×</button></div>
      <p>Adjust this device without changing workspace data.</p>
      <button type="button" aria-pressed={preferences.highContrast} onClick={()=>update('highContrast','High contrast')}><span><strong>High contrast</strong><small>Increase separation between text, controls, and surfaces.</small></span><i aria-hidden="true"/></button>
      <button type="button" aria-pressed={preferences.reduceMotion} onClick={()=>update('reduceMotion','Reduced motion')}><span><strong>Reduce motion</strong><small>Remove transitions and animated scrolling.</small></span><i aria-hidden="true"/></button>
      <button className="accessibility-reset" type="button" onClick={reset}>Reset display preferences</button>
    </div>}
    <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</span>
  </div>;
}
