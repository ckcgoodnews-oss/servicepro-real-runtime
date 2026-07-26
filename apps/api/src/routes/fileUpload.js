const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');
const { validateFile, uploadFile, deleteFile, getPublicUrl } = require('../services/storageService');
const { makeId, now } = require('../services/id');

function tenant(req) { return operationalTenant(req); }

async function upload(req, res) {
  const { filename, mimeType, sizeBytes, folder, base64Data } = req.body || {};

  if (!filename || !mimeType || !base64Data) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'filename, mimeType, and base64Data are required' } });
  }

  const validation = validateFile(filename, sizeBytes || 0, mimeType);
  if (!validation.valid) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: validation.errors.join('; ') } });
  }

  try {
    const buffer = Buffer.from(base64Data, 'base64');
    const result = await uploadFile(tenant(req), folder || 'documents', filename, buffer, mimeType);

    // Store record in media attachments
    const record = {
      id: makeId('file'),
      tenantId: tenant(req),
      filename,
      key: result.key,
      url: result.url,
      mimeType,
      sizeBytes: result.size,
      folder: folder || 'documents',
      uploadedBy: req.context.userId || '',
      createdAt: now()
    };

    const store = req.context.repositories.store;
    if (store.type === 'json') {
      const data = store.read();
      data.mediaAttachments ||= [];
      data.mediaAttachments.push(record);
      store.write(data);
    }

    return sendJson(res, 201, { data: record });
  } catch (err) {
    return sendJson(res, 500, { error: { code: 'upload_failed', message: err.message } });
  }
}

function list(req, res) {
  const store = req.context.repositories.store;
  const tenantId = tenant(req);
  const url = new URL(req.url, 'http://localhost');
  const folder = url.searchParams.get('folder') || '';

  let files = [];
  if (store.type === 'json') {
    const data = store.read();
    data.mediaAttachments ||= [];
    files = data.mediaAttachments.filter(f => f.tenantId === tenantId);
    if (folder) files = files.filter(f => f.folder === folder);
  }

  return sendJson(res, 200, { data: files.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
}

function remove(req, res, id) {
  const store = req.context.repositories.store;
  const tenantId = tenant(req);

  if (store.type === 'json') {
    const data = store.read();
    data.mediaAttachments ||= [];
    const idx = data.mediaAttachments.findIndex(f => f.tenantId === tenantId && f.id === id);
    if (idx < 0) return sendJson(res, 404, { error: { code: 'not_found', message: 'File not found' } });
    const file = data.mediaAttachments[idx];
    deleteFile(file.key).catch(() => {});
    data.mediaAttachments.splice(idx, 1);
    store.write(data);
    return sendJson(res, 200, { data: { deleted: true } });
  }

  return sendJson(res, 404, { error: { code: 'not_found', message: 'File not found' } });
}

module.exports = { upload, list, remove };
