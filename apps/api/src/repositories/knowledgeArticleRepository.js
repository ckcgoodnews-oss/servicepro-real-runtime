const { makeId, now } = require('../services/id');
const { validationError } = require('../errors/domainError');

const ARTICLE_TYPES = ['article', 'manual'];
const STATUSES = ['draft', 'published', 'archived'];

function normalize(input = {}, existing = {}) {
  const title = String(input.title ?? existing.title ?? '').trim();
  const articleType = input.articleType ?? existing.articleType ?? 'article';
  const status = input.status ?? existing.status ?? 'published';
  if (!title) throw validationError('title is required');
  if (!ARTICLE_TYPES.includes(articleType)) throw validationError('articleType must be article or manual');
  if (!STATUSES.includes(status)) throw validationError('status must be draft, published, or archived');
  const rawTags = input.tags === undefined ? (existing.tags || []) : input.tags;
  const tags = Array.isArray(rawTags) ? rawTags : String(rawTags || '').split(',');
  return { title, articleType, category: String(input.category ?? existing.category ?? 'general').trim() || 'general', manufacturer: String(input.manufacturer ?? existing.manufacturer ?? '').trim(), model: String(input.model ?? existing.model ?? '').trim(), content: String(input.content ?? existing.content ?? '').trim(), aiSummary: String(input.aiSummary ?? existing.aiSummary ?? '').trim(), tags: tags.map(tag => String(tag).trim()).filter(Boolean), status };
}

function createKnowledgeArticleRepository(store) {
  if (store.type === 'json') return createJsonRepository(store);
  if (store.type === 'postgres') return createPostgresRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensure(data) { if (!data.knowledgeArticles) data.knowledgeArticles = []; return data; }

function createJsonRepository(store) {
  return {
    list(tenantId) { return ensure(store.read()).knowledgeArticles.filter(row => row.tenantId === tenantId).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))); },
    findById(tenantId, id) { return ensure(store.read()).knowledgeArticles.find(row => row.tenantId === tenantId && row.id === id) || null; },
    create(tenantId, input) { const data = ensure(store.read()); const stamp = now(); const row = { id: makeId('knowledge'), tenantId, ...normalize(input), createdAt: stamp, updatedAt: stamp }; data.knowledgeArticles.push(row); store.write(data); return row; },
    update(tenantId, id, input) { const data = ensure(store.read()); const index = data.knowledgeArticles.findIndex(row => row.tenantId === tenantId && row.id === id); if (index === -1) return null; data.knowledgeArticles[index] = { ...data.knowledgeArticles[index], ...normalize(input, data.knowledgeArticles[index]), id, tenantId, updatedAt: now() }; store.write(data); return data.knowledgeArticles[index]; }
  };
}

const select = `SELECT id::text, tenant_id AS "tenantId", title, article_type AS "articleType", category, manufacturer, model, content, ai_summary AS "aiSummary", tags, status, created_at AS "createdAt", updated_at AS "updatedAt" FROM knowledge_articles`;

function createPostgresRepository(store) {
  return {
    async list(tenantId) { return (await store.query(`${select} WHERE tenant_id=$1 ORDER BY updated_at DESC`, [tenantId])).rows; },
    async findById(tenantId, id) { return (await store.query(`${select} WHERE tenant_id=$1 AND id=$2 LIMIT 1`, [tenantId, id])).rows[0] || null; },
    async create(tenantId, input) { const value = normalize(input); const result = await store.query(`INSERT INTO knowledge_articles (tenant_id,title,article_type,category,manufacturer,model,content,ai_summary,tags,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10) RETURNING id::text,tenant_id AS "tenantId",title,article_type AS "articleType",category,manufacturer,model,content,ai_summary AS "aiSummary",tags,status,created_at AS "createdAt",updated_at AS "updatedAt"`, [tenantId,value.title,value.articleType,value.category,value.manufacturer,value.model,value.content,value.aiSummary,JSON.stringify(value.tags),value.status]); return result.rows[0]; },
    async update(tenantId, id, input) { const existing = await this.findById(tenantId, id); if (!existing) return null; const value = normalize(input, existing); const result = await store.query(`UPDATE knowledge_articles SET title=$3,article_type=$4,category=$5,manufacturer=$6,model=$7,content=$8,ai_summary=$9,tags=$10::jsonb,status=$11,updated_at=now() WHERE tenant_id=$1 AND id=$2 RETURNING id::text,tenant_id AS "tenantId",title,article_type AS "articleType",category,manufacturer,model,content,ai_summary AS "aiSummary",tags,status,created_at AS "createdAt",updated_at AS "updatedAt"`, [tenantId,id,value.title,value.articleType,value.category,value.manufacturer,value.model,value.content,value.aiSummary,JSON.stringify(value.tags),value.status]); return result.rows[0] || null; }
  };
}

module.exports = { ARTICLE_TYPES, STATUSES, normalizeKnowledgeArticle: normalize, createKnowledgeArticleRepository };
