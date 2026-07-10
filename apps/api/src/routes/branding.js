const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.branding; }

function filters(req) {
  return { status: req.body.status || '' };
}

function listBrands(req, res) {
  Promise.resolve(repo(req).listBrands(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}

function createBrand(req, res) {
  Promise.resolve(repo(req).createBrand(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function getBrand(req, res, id) {
  Promise.resolve(repo(req).findBrandById(tenant(req), id)).then(data => {
    if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'Brand not found' } });
    return sendJson(res, 200, { data });
  });
}

function updateBrand(req, res, id) {
  Promise.resolve(repo(req).updateBrand(tenant(req), id, req.body))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Brand not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function listAssets(req, res, brandId) {
  Promise.resolve(repo(req).listAssets(tenant(req), brandId)).then(data => sendJson(res, 200, { data }));
}

function createAsset(req, res, brandId) {
  Promise.resolve(repo(req).createAsset(tenant(req), { ...req.body, brandId }))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function listDomains(req, res, brandId) {
  Promise.resolve(repo(req).listDomains(tenant(req), brandId)).then(data => sendJson(res, 200, { data }));
}

function createDomain(req, res, brandId) {
  Promise.resolve(repo(req).createDomain(tenant(req), { ...req.body, brandId }))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function verifyDomain(req, res, id) {
  Promise.resolve(repo(req).verifyDomain(tenant(req), id, req.body.expectedToken || ''))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Domain not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function resolve(req, res, brandId) {
  Promise.resolve(repo(req).resolve(tenant(req), brandId))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Brand not found' } }));
}

function css(req, res, brandId) {
  Promise.resolve(repo(req).css(tenant(req), brandId)).then(data => {
    if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'Brand not found' } });
    res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
    return res.end(data);
  });
}

module.exports = {
  listBrands,
  createBrand,
  getBrand,
  updateBrand,
  listAssets,
  createAsset,
  listDomains,
  createDomain,
  verifyDomain,
  resolve,
  css
};
