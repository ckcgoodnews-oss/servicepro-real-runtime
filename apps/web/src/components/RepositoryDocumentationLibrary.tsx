'use client';

import { Fragment, type ReactNode, useEffect, useMemo, useState } from 'react';

type LibraryDocument = { id:string; sourcePath:string; title:string; subtitle:string; summary:string; category:string; readMinutes:number; headings:number; words:number; markdownUrl:string; docxUrl:string; pdfUrl:string };
type LibraryIndex = { documentCount:number; categories:Record<string,number>; documents:LibraryDocument[] };
type Block = { type:'heading'; level:number; text:string } | { type:'paragraph'; text:string } | { type:'quote'; text:string } | { type:'code'; language:string; text:string } | { type:'list'; ordered:boolean; items:string[] } | { type:'table'; rows:string[][] } | { type:'rule' };

function inline(text:string):ReactNode[] {
  return text.split(/(\*\*.*?\*\*|`.*?`|\[[^\]]+]\([^)]+\))/g).filter(Boolean).map((token,index) => {
    if(token.startsWith('**')&&token.endsWith('**')) return <strong key={index}>{token.slice(2,-2)}</strong>;
    if(token.startsWith('`')&&token.endsWith('`')) return <code key={index}>{token.slice(1,-1)}</code>;
    const link=token.match(/^\[([^\]]+)]\(([^)]+)\)$/);
    if(link){
      const samePage=link[2].match(/^https?:\/\/(?:www\.)?aardvark-enterprises\.net\/docs\/?(#[^\s]*)$/i)||link[2].match(/^\/docs\/?(#[^\s]*)$/i);
      const href=samePage?samePage[1]:link[2];
      const external=/^https?:\/\//i.test(href);
      return <a key={index} href={href} target={external?'_blank':undefined} rel={external?'noreferrer':undefined}>{link[1]}</a>;
    }
    return <Fragment key={index}>{token}</Fragment>;
  });
}

function headingSlug(text:string):string {
  return text.replace(/\[([^\]]+)]\([^)]+\)/g,'$1').replace(/[*_`]/g,'').toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-');
}

function parseMarkdown(markdown:string):Block[] {
  const lines=markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'').split(/\r?\n/); const blocks:Block[]=[]; let index=0;
  while(index<lines.length){
    const line=lines[index]; if(!line.trim()){index+=1;continue;}
    if(line.startsWith('```')){const language=line.slice(3).trim();const content:string[]=[];index+=1;while(index<lines.length&&!lines[index].startsWith('```'))content.push(lines[index++]);blocks.push({type:'code',language,text:content.join('\n')});index+=1;continue;}
    const heading=line.match(/^(#{1,6})\s+(.+)$/);if(heading){blocks.push({type:'heading',level:heading[1].length,text:heading[2]});index+=1;continue;}
    if(line.trim()==='---'){blocks.push({type:'rule'});index+=1;continue;}
    if(line.startsWith('>')){const content:string[]=[];while(index<lines.length&&lines[index].startsWith('>'))content.push(lines[index++].replace(/^>\s?/,''));blocks.push({type:'quote',text:content.join(' ')});continue;}
    if(line.startsWith('|')&&index+1<lines.length&&/^\|?\s*:?-+/.test(lines[index+1])){const rows:string[][]=[];while(index<lines.length&&lines[index].startsWith('|')){const cells=lines[index].trim().replace(/^\||\|$/g,'').split('|').map(cell=>cell.trim());if(!cells.every(cell=>/^:?-+:?$/.test(cell.replace(/\s/g,''))))rows.push(cells);index+=1;}blocks.push({type:'table',rows});continue;}
    const list=line.match(/^\s*(?:([-*])|(\d+)\.)\s+(.+)$/);if(list){const ordered=Boolean(list[2]);const items:string[]=[];const matcher=ordered?/^\s*\d+\.\s+(.+)$/:/^\s*[-*]\s+(.+)$/;while(index<lines.length){const item=lines[index].match(matcher);if(!item)break;items.push(item[1]);index+=1;}blocks.push({type:'list',ordered,items});continue;}
    const content=[line.trim()];index+=1;while(index<lines.length&&lines[index].trim()&&!/^(#{1,6})\s|^```|^>|^\||^---$|^\s*(?:[-*]|\d+\.)\s+/.test(lines[index]))content.push(lines[index++].trim());blocks.push({type:'paragraph',text:content.join(' ')});
  }
  return blocks;
}

function MarkdownDocument({markdown}:{markdown:string}){
  const blocks=useMemo(()=>parseMarkdown(markdown),[markdown]);
  useEffect(()=>{
    if(!window.location.hash)return;
    const targetId=decodeURIComponent(window.location.hash.slice(1));
    const frame=window.requestAnimationFrame(()=>document.getElementById(targetId)?.scrollIntoView({block:'start'}));
    return()=>window.cancelAnimationFrame(frame);
  },[blocks]);
  return <div className="repository-markdown">{blocks.map((block,index)=>{
    if(block.type==='heading'){const id=headingSlug(block.text);const content=<><a className="repository-heading-anchor" href={`#${id}`} aria-label={`Link to ${block.text}`}>#</a>{inline(block.text)}</>;if(block.level===1)return <h1 id={id} key={index}>{content}</h1>;if(block.level===2)return <h2 id={id} key={index}>{content}</h2>;if(block.level===3)return <h3 id={id} key={index}>{content}</h3>;return <h4 id={id} key={index}>{content}</h4>;}
    if(block.type==='paragraph')return <p key={index}>{inline(block.text)}</p>;
    if(block.type==='quote')return <blockquote key={index}>{inline(block.text)}</blockquote>;
    if(block.type==='rule')return <hr key={index}/>;
    if(block.type==='code')return <figure className="repository-code" key={index}><figcaption>{block.language||'Code example'}</figcaption><pre><code>{block.text}</code></pre></figure>;
    if(block.type==='list'){const children=block.items.map((item,itemIndex)=><li key={itemIndex}>{inline(item)}</li>);return block.ordered?<ol key={index}>{children}</ol>:<ul key={index}>{children}</ul>;}
    return <div className="repository-table-wrap" key={index}><table><thead><tr>{block.rows[0]?.map((cell,cellIndex)=><th key={cellIndex}>{inline(cell)}</th>)}</tr></thead><tbody>{block.rows.slice(1).map((row,rowIndex)=><tr key={rowIndex}>{row.map((cell,cellIndex)=><td key={cellIndex}>{inline(cell)}</td>)}</tr>)}</tbody></table></div>;
  })}</div>;
}

export function RepositoryDocumentationLibrary(){
  const [library,setLibrary]=useState<LibraryIndex|null>(null);const [query,setQuery]=useState('');const [category,setCategory]=useState('All documents');const [selectedId,setSelectedId]=useState('sales/SERVICEPRO-ENTERPRISE-PLATFORM');const [markdown,setMarkdown]=useState('');const [loadingDocument,setLoadingDocument]=useState(false);const [error,setError]=useState('');
  useEffect(()=>{fetch('/documentation/library/index.json').then(async response=>{if(!response.ok)throw new Error('The documentation index could not be loaded.');setLibrary(await response.json());}).catch(problem=>setError(problem instanceof Error?problem.message:'The documentation index could not be loaded.'));},[]);
  const visible=useMemo(()=>{if(!library)return[];const term=query.trim().toLowerCase();return library.documents.filter(document=>(category==='All documents'||document.category===category)&&(!term||`${document.title} ${document.subtitle} ${document.summary} ${document.sourcePath}`.toLowerCase().includes(term)));},[category,library,query]);
  const selected=visible.find(document=>document.id===selectedId)||visible[0];
  useEffect(()=>{if(!selected)return;setLoadingDocument(true);setError('');fetch(selected.markdownUrl).then(async response=>{if(!response.ok)throw new Error('This document could not be loaded.');setMarkdown(await response.text());}).catch(problem=>setError(problem instanceof Error?problem.message:'This document could not be loaded.')).finally(()=>setLoadingDocument(false));},[selected?.id]);
  if(error&&!library)return <div className="docs-empty" role="alert">{error}</div>;if(!library)return <div className="docs-empty" aria-live="polite">Loading the complete documentation library…</div>;
  return <div className="repository-library"><div className="repository-controls"><label><span>Search all {library.documentCount} documents</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search titles, summaries, and source paths"/></label><label><span>Collection</span><select value={category} onChange={event=>setCategory(event.target.value)}><option>All documents</option>{Object.entries(library.categories).map(([name,count])=><option key={name} value={name}>{name} ({count})</option>)}</select></label></div><div className="docs-layout repository-layout"><aside className="docs-index repository-index"><p>{visible.length} of {library.documentCount} documents</p>{visible.map(document=><button key={document.id} className={selected?.id===document.id?'active':''} onClick={()=>setSelectedId(document.id)}><span>{document.category}</span><strong>{document.title}</strong><small>{document.readMinutes} min · {document.words.toLocaleString()} words</small></button>)}</aside><article className="docs-article repository-article">{selected&&<><header><span>{selected.category}</span><h2>{selected.title}</h2><p>{selected.summary}</p><small>{selected.readMinutes} minute read · {selected.headings} sections · Source: {selected.sourcePath}</small><nav className="repository-downloads" aria-label="Document downloads"><a href={selected.markdownUrl} download>Markdown</a><a href={selected.docxUrl} download>Word</a><a href={selected.pdfUrl} target="_blank" rel="noreferrer">PDF</a></nav></header>{loadingDocument?<div className="docs-empty">Loading document…</div>:error?<div className="docs-empty" role="alert">{error}</div>:<MarkdownDocument markdown={markdown}/>}</>}</article></div></div>;
}
