'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

type Page = { id: string; title: string; slug: string; status: string; sections: Section[]; version: number; updatedAt: string };
type Section = { type: string; config: Record<string, unknown> };
type Template = { key: string; label: string; fields: string[] };

export function WebsiteEditor() {
  const [pages, setPages] = useState<Page[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [view, setView] = useState<'pages' | 'editor' | 'theme'>('pages');
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [pRes, tRes] = await Promise.all([
      api<Page[]>('GET', '/api/v1/website/pages'),
      api<Template[]>('GET', '/api/v1/website/templates')
    ]);
    if (pRes.data) setPages(pRes.data);
    if (tRes.data) setTemplates(tRes.data);
  }

  async function createPage() {
    if (!newTitle.trim()) return;
    const result = await api<Page>('POST', '/api/v1/website/pages', { title: newTitle });
    if (result.data) { setPages(prev => [...prev, result.data!]); setNewTitle(''); }
  }

  async function publishPage(id: string) {
    const result = await api<Page>('POST', `/api/v1/website/pages/${id}/publish`);
    if (result.data) setPages(prev => prev.map(p => p.id === id ? result.data! : p));
  }

  async function deletePage(id: string) {
    await api('DELETE', `/api/v1/website/pages/${id}`);
    setPages(prev => prev.filter(p => p.id !== id));
    if (selectedPage?.id === id) { setSelectedPage(null); setView('pages'); }
  }

  async function addSection(type: string) {
    if (!selectedPage) return;
    const sections = [...(selectedPage.sections || []), { type, config: {} }];
    const result = await api<Page>('PATCH', `/api/v1/website/pages/${selectedPage.id}`, { sections });
    if (result.data) { setSelectedPage(result.data); setPages(prev => prev.map(p => p.id === result.data!.id ? result.data! : p)); }
  }

  function editPage(page: Page) { setSelectedPage(page); setView('editor'); }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e0e0e0', paddingBottom: '0.5rem' }}>
        <button onClick={() => setView('pages')} style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: view === 'pages' ? 600 : 400, background: view === 'pages' ? '#e8f0fe' : 'transparent', color: view === 'pages' ? '#1a73e8' : '#5f6368' }}>Pages</button>
        <button onClick={() => setView('editor')} disabled={!selectedPage} style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: view === 'editor' ? 600 : 400, background: view === 'editor' ? '#e8f0fe' : 'transparent', color: view === 'editor' ? '#1a73e8' : '#5f6368', opacity: selectedPage ? 1 : 0.5 }}>Editor</button>
        <button onClick={() => setView('theme')} style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: view === 'theme' ? 600 : 400, background: view === 'theme' ? '#e8f0fe' : 'transparent', color: view === 'theme' ? '#1a73e8' : '#5f6368' }}>Theme</button>
      </div>

      {view === 'pages' && (
        <div>
          {/* Create page */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="New page title..." style={{ flex: 1, padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px' }} />
            <button onClick={createPage} style={{ padding: '0.5rem 1rem', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Create Page</button>
          </div>
          {/* Page list */}
          {pages.length === 0 && <p style={{ color: '#5f6368', textAlign: 'center', padding: '2rem' }}>No pages yet. Create your first page above.</p>}
          {pages.map(page => (
            <div key={page.id} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.9rem' }}>{page.title}</strong>
                <p style={{ fontSize: '0.75rem', color: '#5f6368' }}>/{page.slug} • v{page.version} • {(page.sections || []).length} sections</p>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: page.status === 'published' ? '#e6f4ea' : '#f5f5f5', color: page.status === 'published' ? '#34a853' : '#5f6368' }}>{page.status}</span>
                <button onClick={() => editPage(page)} style={{ padding: '0.3rem 0.6rem', border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Edit</button>
                <button onClick={() => publishPage(page.id)} style={{ padding: '0.3rem 0.6rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', background: '#34a853', color: '#fff' }}>Publish</button>
                <button onClick={() => deletePage(page.id)} style={{ padding: '0.3rem 0.6rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', background: '#ea4335', color: '#fff' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'editor' && selectedPage && (
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '1rem' }}>
          {/* Sidebar: section templates */}
          <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>Add Section</h4>
            {templates.map(t => (
              <button key={t.key} onClick={() => addSection(t.key)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem', margin: '0.25rem 0', border: '1px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer', background: '#fff', fontSize: '0.8rem' }}>
                {t.label}
              </button>
            ))}
          </div>
          {/* Canvas */}
          <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', minHeight: '400px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>{selectedPage.title}</h3>
            {(selectedPage.sections || []).length === 0 && (
              <p style={{ color: '#9e9e9e', textAlign: 'center', padding: '3rem' }}>Click a section template on the left to add it to the page.</p>
            )}
            {(selectedPage.sections || []).map((section, i) => (
              <div key={i} style={{ border: '1px dashed #c0c0c0', borderRadius: '6px', padding: '1rem', marginBottom: '0.5rem', background: '#fafafa' }}>
                <span style={{ fontSize: '0.75rem', color: '#5f6368', textTransform: 'uppercase' }}>Section {i + 1}: {section.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'theme' && <ThemeEditor />}
    </div>
  );
}

function ThemeEditor() {
  const [theme, setTheme] = useState({ primaryColor: '#1a73e8', secondaryColor: '#34a853', fontFamily: 'Inter, sans-serif' });

  useEffect(() => {
    api<Record<string, string>>('GET', '/api/v1/website/theme').then(res => { if (res.data) setTheme(prev => ({ ...prev, ...res.data })); });
  }, []);

  async function saveTheme() {
    await api('PATCH', '/api/v1/website/theme', theme);
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', maxWidth: '500px' }}>
      <h3 style={{ marginBottom: '1rem' }}>Theme Settings</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Primary Color</label>
          <input type="color" value={theme.primaryColor} onChange={e => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Secondary Color</label>
          <input type="color" value={theme.secondaryColor} onChange={e => setTheme(prev => ({ ...prev, secondaryColor: e.target.value }))} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>Font Family</label>
          <select value={theme.fontFamily} onChange={e => setTheme(prev => ({ ...prev, fontFamily: e.target.value }))} style={{ padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px' }}>
            <option value="Inter, sans-serif">Inter</option>
            <option value="Roboto, sans-serif">Roboto</option>
            <option value="Open Sans, sans-serif">Open Sans</option>
            <option value="Poppins, sans-serif">Poppins</option>
            <option value="Lato, sans-serif">Lato</option>
          </select>
        </div>
        <button onClick={saveTheme} style={{ padding: '0.6rem 1.2rem', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, alignSelf: 'flex-start' }}>Save Theme</button>
      </div>
    </div>
  );
}
