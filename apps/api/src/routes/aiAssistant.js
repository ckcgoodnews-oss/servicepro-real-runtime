const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');

function kbRepo(req) { return req.context.repositories.aiKnowledge; }
function tenant(req) { return operationalTenant(req); }

// Knowledge Base CRUD
function listArticles(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const filters = { category: url.searchParams.get('category') || '', query: url.searchParams.get('q') || '' };
  Promise.resolve(kbRepo(req).listArticles(tenant(req), filters))
    .then(data => sendJson(res, 200, { data }));
}

function getArticle(req, res, id) {
  Promise.resolve(kbRepo(req).findById(tenant(req), id))
    .then(data => {
      if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'Article not found' } });
      kbRepo(req).incrementView(tenant(req), id);
      return sendJson(res, 200, { data });
    });
}

function createArticle(req, res) {
  Promise.resolve(kbRepo(req).create(tenant(req), { ...req.body, createdBy: req.context.userId || '' }))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function updateArticle(req, res, id) {
  Promise.resolve(kbRepo(req).update(tenant(req), id, req.body || {}))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Article not found' } }));
}

function deleteArticle(req, res, id) {
  Promise.resolve(kbRepo(req).delete(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Article not found' } }));
}

// AI Search
function search(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const query = url.searchParams.get('q') || (req.body || {}).query || '';
  const limit = Number(url.searchParams.get('limit') || 5);
  if (!query) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'query (q) is required' } });
  Promise.resolve(kbRepo(req).search(tenant(req), query, limit))
    .then(data => sendJson(res, 200, { data }));
}

// AI Chat (RAG-based)
function chat(req, res) {
  const { message, conversationId } = req.body || {};
  if (!message) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'message is required' } });

  Promise.resolve()
    .then(async () => {
      // Retrieve relevant knowledge base context
      const { context, articles } = kbRepo(req).getContext(tenant(req), message);

      // Build response (in production, call OpenAI/Anthropic with context)
      const aiProvider = process.env.AI_PROVIDER || '';
      const aiKey = process.env.AI_API_KEY || '';

      if (aiProvider && aiKey) {
        // Real AI call
        const systemPrompt = `You are a helpful service business assistant. Use the following knowledge base context to answer questions. If you don't know the answer, say so.\n\nContext:\n${context}`;
        const aiRes = await fetch(aiProvider === 'openai' ? 'https://api.openai.com/v1/chat/completions' : 'https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(aiProvider === 'openai' ? { 'Authorization': `Bearer ${aiKey}` } : { 'x-api-key': aiKey, 'anthropic-version': '2023-06-01' })
          },
          body: JSON.stringify(aiProvider === 'openai' ? {
            model: process.env.AI_MODEL || 'gpt-4o-mini',
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
            max_tokens: 1000
          } : {
            model: process.env.AI_MODEL || 'claude-sonnet-4-20250514',
            system: systemPrompt,
            messages: [{ role: 'user', content: message }],
            max_tokens: 1000
          })
        });
        const aiData = await aiRes.json();
        const reply = aiProvider === 'openai'
          ? aiData.choices?.[0]?.message?.content || 'I could not generate a response.'
          : aiData.content?.[0]?.text || 'I could not generate a response.';

        return sendJson(res, 200, { data: { reply, sources: articles, conversationId: conversationId || `conv_${Date.now()}` } });
      }

      // Fallback: return knowledge base results as "answer"
      const reply = context
        ? `Based on our knowledge base, here's what I found:\n\n${context.slice(0, 500)}`
        : `I don't have specific information about "${message}" in the knowledge base. Please contact support for assistance.`;

      return sendJson(res, 200, { data: { reply, sources: articles, conversationId: conversationId || `conv_${Date.now()}`, mode: 'knowledge_base_only' } });
    })
    .catch(err => sendJson(res, 500, { error: { code: 'ai_error', message: err.message } }));
}

function markHelpful(req, res, id) {
  Promise.resolve(kbRepo(req).markHelpful(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Article not found' } }));
}

module.exports = { listArticles, getArticle, createArticle, updateArticle, deleteArticle, search, chat, markHelpful };
