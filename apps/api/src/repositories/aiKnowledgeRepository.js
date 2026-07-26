const { makeId, now } = require('../services/id');

function createAiKnowledgeRepository(store) {
  if (store.type === 'json') return createJsonImpl(store);
  if (store.type === 'postgres') return createPostgresImpl(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonImpl(store) {
  function data() { return store.read(); }
  function save(d) { store.write(d); }

  return {
    listArticles(tenantId, filters = {}) {
      const d = data();
      d.aiKnowledge ||= [];
      let results = d.aiKnowledge.filter(a => a.tenantId === tenantId);
      if (filters.category) results = results.filter(a => a.category === filters.category);
      if (filters.query) {
        const q = filters.query.toLowerCase();
        results = results.filter(a => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q) || (a.tags || []).some(t => t.toLowerCase().includes(q)));
      }
      return results.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

    findById(tenantId, id) {
      const d = data();
      d.aiKnowledge ||= [];
      return d.aiKnowledge.find(a => a.tenantId === tenantId && a.id === id) || null;
    },

    create(tenantId, input) {
      const d = data();
      d.aiKnowledge ||= [];
      if (!input.title || !input.content) { const err = new Error('title and content are required'); err.status = 400; err.code = 'validation_failed'; throw err; }
      const article = {
        id: makeId('kb'),
        tenantId,
        title: input.title,
        content: input.content,
        category: input.category || 'general',
        tags: input.tags || [],
        status: input.status || 'published',
        embedding: null,
        viewCount: 0,
        helpfulCount: 0,
        createdBy: input.createdBy || '',
        createdAt: now(),
        updatedAt: now()
      };
      d.aiKnowledge.push(article);
      save(d);
      return article;
    },

    update(tenantId, id, input) {
      const d = data();
      d.aiKnowledge ||= [];
      const article = d.aiKnowledge.find(a => a.tenantId === tenantId && a.id === id);
      if (!article) return null;
      for (const key of ['title', 'content', 'category', 'tags', 'status']) {
        if (input[key] !== undefined) article[key] = input[key];
      }
      article.updatedAt = now();
      save(d);
      return article;
    },

    delete(tenantId, id) {
      const d = data();
      d.aiKnowledge ||= [];
      const idx = d.aiKnowledge.findIndex(a => a.tenantId === tenantId && a.id === id);
      if (idx < 0) return null;
      return d.aiKnowledge.splice(idx, 1)[0];
    },

    // Natural language search (simple TF-IDF style for MVP, replace with embeddings later)
    search(tenantId, query, limit = 5) {
      if (!query) return [];
      const articles = this.listArticles(tenantId, {});
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

      const scored = articles.map(article => {
        const text = `${article.title} ${article.content} ${(article.tags || []).join(' ')}`.toLowerCase();
        let score = 0;
        for (const term of terms) {
          const matches = (text.match(new RegExp(term, 'g')) || []).length;
          score += matches;
          if (article.title.toLowerCase().includes(term)) score += 3;
        }
        return { ...article, relevanceScore: score };
      }).filter(r => r.relevanceScore > 0);

      return scored.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit);
    },

    // AI chat context retrieval
    getContext(tenantId, query, maxTokens = 2000) {
      const relevant = this.search(tenantId, query, 3);
      let context = '';
      let tokens = 0;
      for (const article of relevant) {
        const chunk = `## ${article.title}\n${article.content}\n\n`;
        const chunkTokens = Math.ceil(chunk.length / 4);
        if (tokens + chunkTokens > maxTokens) break;
        context += chunk;
        tokens += chunkTokens;
      }
      return { context, articles: relevant.map(a => ({ id: a.id, title: a.title, relevanceScore: a.relevanceScore })) };
    },

    incrementView(tenantId, id) {
      const d = data();
      d.aiKnowledge ||= [];
      const article = d.aiKnowledge.find(a => a.tenantId === tenantId && a.id === id);
      if (article) { article.viewCount = (article.viewCount || 0) + 1; save(d); }
      return article;
    },

    markHelpful(tenantId, id) {
      const d = data();
      d.aiKnowledge ||= [];
      const article = d.aiKnowledge.find(a => a.tenantId === tenantId && a.id === id);
      if (article) { article.helpfulCount = (article.helpfulCount || 0) + 1; save(d); }
      return article;
    }
  };
}

function createPostgresImpl(store) {
  return createJsonImpl(store);
}

module.exports = { createAiKnowledgeRepository };
