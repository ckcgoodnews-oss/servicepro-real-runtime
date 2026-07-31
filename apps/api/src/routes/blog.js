const { sendJson } = require('../utils/http');

async function list(req, res) {
  const posts = await req.context.repositories.blog.list(req.context.tenantId);
  return sendJson(res, 200, { data: posts });
}

async function create(req, res) {
  const post = await req.context.repositories.blog.create(req.context.tenantId, req.body, req.context.userId);
  return sendJson(res, 201, { data: post });
}

async function update(req, res, id) {
  const post = await req.context.repositories.blog.update(req.context.tenantId, id, req.body);
  return post ? sendJson(res, 200, { data: post }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Post not found' } });
}

async function remove(req, res, id) {
  const deleted = await req.context.repositories.blog.remove(req.context.tenantId, id);
  return deleted ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Post not found' } });
}

async function publicList(req, res, slug) {
  const posts = await req.context.repositories.blog.publicList(slug);
  return sendJson(res, 200, { data: posts });
}

module.exports = { list, create, update, remove, publicList };
