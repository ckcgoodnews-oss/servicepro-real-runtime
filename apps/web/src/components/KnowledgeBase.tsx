'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

type Article = { id: string; title: string; content: string; category: string; tags: string[]; status: string; viewCount: number; helpfulCount: number; updatedAt: string };

export function KnowledgeBase() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [search, setSearch] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('general');

  useEffect(() => { loadArticles(); }, []);

  async function loadArticles() {
    const res = await api<Article[]>('GET', `/api/v1/ai/knowledge${search ? `?q=${encodeURIComponent(search)}` : ''}`);
    if (res.data) setArticles(res.data);
  }

  async function createArticle() {
    if (!newTitle.trim() || !newContent.trim()) return;
    const res = await api<Article>('POST', '/api/v1/ai/knowledge', { title: newTitle, content: newContent, category: newCategory });
    if (res.data) { setArticles(prev => [res.data!, ...prev]); setNewTitle(''); setNewContent(''); setView('list'); }
  }

  async function deleteArticle(id: string) {
    await api('DELETE', `/api/v1/ai/knowledge/${id}`);
    setArticles(prev => prev.filter(a => a.id !== id));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
        <Kpi label="Articles" value={String(articles.length)} color="#1a73e8" />
        <Kpi label="Total Views" value={String(articles.reduce((s, a) => s + (a.viewCount || 0), 0))} color="#34a853" />
        <Kpi label="Helpful" value={String(articles.reduce((s, a) => s + (a.helpfulCount || 0), 0))} color="#e67c00" />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadArticles()} placeholder="Search articles..." style={{ padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', width: '250px' }} />
          <button onClick={loadArticles} style={{ padding: '0.5rem 1rem', border: '1px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer' }}>Search</button>
        </div>
        <button onClick={() => setView(view === 'list' ? 'create' : 'list')} style={{ padding: '0.5rem 1rem', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          {view === 'list' ? '+ New Article' : 'Back to List'}
        </button>
      </div>

      {view === 'create' && (
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Article title" style={{ padding: '0.6rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '1rem', fontWeight: 500 }} />
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', width: '200px' }}>
              <option value="general">General</option>
              <option value="troubleshooting">Troubleshooting</option>
              <option value="procedures">Procedures</option>
              <option value="safety">Safety</option>
              <option value="products">Products</option>
              <option value="faq">FAQ</option>
            </select>
            <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Article content (supports markdown)" rows={12} style={{ padding: '0.6rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem', resize: 'vertical' }} />
            <button onClick={createArticle} style={{ padding: '0.6rem 1.2rem', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', alignSelf: 'flex-start', fontWeight: 500 }}>Publish Article</button>
          </div>
        </div>
      )}

      {view === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {articles.length === 0 && <p style={{ color: '#5f6368', textAlign: 'center', padding: '2rem' }}>No articles yet. Create your first knowledge base article.</p>}
          {articles.map(article => (
            <div key={article.id} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong style={{ fontSize: '0.9rem' }}>{article.title}</strong>
                <p style={{ fontSize: '0.8rem', color: '#5f6368', marginTop: '0.2rem' }}>{article.content.slice(0, 120)}...</p>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', fontSize: '0.7rem', color: '#9e9e9e' }}>
                  <span>{article.category}</span>
                  <span>👁 {article.viewCount || 0}</span>
                  <span>👍 {article.helpfulCount || 0}</span>
                </div>
              </div>
              <button onClick={() => deleteArticle(article.id)} style={{ padding: '0.2rem 0.5rem', border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', color: '#ea4335' }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
      <p style={{ fontSize: '1.4rem', fontWeight: 700, color }}>{value}</p>
      <p style={{ fontSize: '0.75rem', color: '#5f6368' }}>{label}</p>
    </div>
  );
}
