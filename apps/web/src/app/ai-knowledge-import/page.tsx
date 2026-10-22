'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authFetch, readSession, tenantId } from '@/auth/session';

const columns = ['title', 'content', 'category', 'tags'];
const sample = 'title,content,category,tags\r\n"Business hours","We are open Monday through Friday, 9 AM to 5 PM.","General","hours;availability"\r\n"Scheduling","Contact our office to request an appointment.","Appointments","booking;scheduling"\r\n';

function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ''; let quoted = false;
  const source = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === '"') {
      if (quoted && source[i + 1] === '"') { cell += '"'; i++; }
      else if (!quoted && cell === '') quoted = true;
      else if (quoted) quoted = false;
      else throw new Error('Invalid quote on CSV row ' + (rows.length + 1));
    } else if (char === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && source[i + 1] === '\n') i++;
      row.push(cell); if (row.some(value => value.trim())) rows.push(row);
      row = []; cell = '';
    } else cell += char;
  }
  if (quoted) throw new Error('Unclosed quoted field');
  row.push(cell); if (row.some(value => value.trim())) rows.push(row);
  return rows;
}

type Article = { title: string; content: string; category: string; tags: string[] };

export default function AiKnowledgeCsvImportPage() {
  const [items, setItems] = useState<Article[]>([]);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [busy, setBusy] = useState(false);

  function download() {
    const url = URL.createObjectURL(new Blob([sample], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'servicepro-ai-knowledge-template.csv'; link.click();
    URL.revokeObjectURL(url);
  }

  async function load(file?: File) {
    setItems([]); setError(''); setResult('');
    if (!file) return;
    try {
      if (file.size > 1024 * 1024) throw new Error('CSV file must be 1 MB or smaller.');
      const rows = parseCsv(await file.text());
      if (rows.length < 2) throw new Error('The file has no data rows.');
      const header = rows.shift()!.map(value => value.trim().toLowerCase());
      if (header.length !== columns.length || columns.some((value, index) => header[index] !== value)) {
        throw new Error('Expected CSV headers: ' + columns.join(', '));
      }
      if (rows.length > 200) throw new Error('Import at most 200 rows per file.');
      const parsed = rows.map((values, index) => {
        if (values.length !== columns.length) throw new Error('Row ' + (index + 2) + ' has the wrong number of columns.');
        const [title, content, category, tags] = values.map(value => value.trim());
        if (!title || !content) throw new Error('Row ' + (index + 2) + ' needs a title and content.');
        if (title.length > 200 || content.length > 10000) throw new Error('Row ' + (index + 2) + ' exceeds length limits.');
        return { title, content, category, tags: tags.split(';').map(tag => tag.trim()).filter(Boolean) };
      });
      setItems(parsed);
    } catch (problem) { setError(problem instanceof Error ? problem.message : 'Could not read CSV'); }
  }

  async function upload() {
    if (!readSession()) { setError('Sign in to ServicePRO before importing.'); return; }
    if (!items.length) return;
    setBusy(true); setError(''); setResult('');
    let imported = 0;
    for (const item of items) {
      try {
        const response = await authFetch('/api/v1/ai/knowledge', { method: 'POST', body: JSON.stringify(item) });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error?.message || 'HTTP ' + response.status);
        }
        imported++;
      } catch (problem) {
        setError('Stopped at row ' + (imported + 2) + ': ' + (problem instanceof Error ? problem.message : 'Upload failed') + '. Previous rows were saved; do not re-upload them.');
        break;
      }
    }
    setResult(imported + ' of ' + items.length + ' articles imported into workspace ' + tenantId() + '.');
    setBusy(false);
  }

  return <main className="simple-auth"><section className="auth-card" style={{ maxWidth: 820, width: '100%' }}>
    <h1>AI knowledge CSV import</h1>
    <p>Download the template, enter your company-specific questions and answers, then upload it to your active ServicePRO workspace. Each CSV row becomes a knowledge article for the AI assistant.</p>
    <p><strong>Active workspace:</strong> {typeof window !== 'undefined' ? tenantId() : 'Your current workspace'}</p>
    <button className="button" type="button" onClick={download}>Download CSV template</button>
    <p>Required: <code>title</code> (question), <code>content</code> (answer). Optional: <code>category</code>, <code>tags</code> (semicolon-separated). Save as UTF-8 CSV. Maximum 200 rows and 1 MB per upload.</p>
    <label>Upload completed CSV<input type="file" accept=".csv,text/csv" disabled={busy} onChange={event => void load(event.target.files?.[0])}/></label>
    {items.length > 0 && <><p><strong>{items.length} rows ready to import</strong></p><table><thead><tr><th>Question / title</th><th>Category</th></tr></thead><tbody>{items.slice(0, 10).map((item, index) => <tr key={index}><td>{item.title}</td><td>{item.category}</td></tr>)}</tbody></table>{items.length > 10 && <p>Showing first 10 rows.</p>}<button className="button" type="button" disabled={busy} onClick={() => void upload()}>{busy ? 'Importing…' : 'Import into this workspace'}</button></>}
    {error && <p role="alert" className="form-error">{error}</p>}
    {result && <p role="status" className="form-success">{result}</p>}
    <p><Link href="/dashboard">Back to dashboard</Link></p>
  </section></main>;
}
